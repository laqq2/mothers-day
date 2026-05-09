import { neon } from "@neondatabase/serverless";
import { cache } from "react";

import type { MemoryCard, Timeline, TimelinePayload } from "@/types/timeline";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

async function resolveBlobUrl(pathOrUrl: string | null): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;
  return `/api/blob-image?path=${encodeURIComponent(pathOrUrl)}`;
}

const demoTimeline: TimelinePayload = {
  timeline: {
    id: "demo-id",
    slug: "demo-timeline",
    dedicated_to: "Mum",
    creator_name: "Evan",
    hero_image_url:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=80",
    final_message:
      "You made ordinary days feel like magic. Thank you for teaching me tenderness, courage, and how to find light in every season. Happy Mother's Day.",
    theme: "warm",
    ending_effect: "petals",
  },
  cards: [
    {
      id: "1",
      position: 0,
      year: 2003,
      caption: "Saturday mornings meant pancakes, cartoons, and your laugh filling the kitchen.",
      emotion_tag: "nostalgic",
      image_url:
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "2",
      position: 1,
      year: 2011,
      caption: "At every school concert, I could always find you in the crowd before the first note.",
      emotion_tag: "proud",
      image_url:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "3",
      position: 2,
      year: 2018,
      caption: "When life got heavy, you reminded me I could always begin again.",
      emotion_tag: "grateful",
      image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    },
  ],
};

export const getTimelineBySlug = cache(async (slug: string): Promise<TimelinePayload | null> => {
  if (slug === "demo-timeline") {
    return demoTimeline;
  }

  const sql = getSql();
  if (!sql) {
    return null;
  }

  const timelineRows = await sql`
    select id, slug, dedicated_to, creator_name, hero_image_url, final_message, theme, ending_effect
    from timelines
    where slug = ${slug}
    limit 1
  `;

  const timeline = timelineRows[0] as Timeline | undefined;
  if (!timeline) {
    return null;
  }

  const cardRows = await sql`
    select id, position, year, caption, emotion_tag, image_url
    from memory_cards
    where timeline_id = ${timeline.id}
    order by position asc
  `;

  const cards = cardRows as MemoryCard[];

  const heroResolved = await resolveBlobUrl(timeline.hero_image_url);
  const resolvedCards = await Promise.all(
    cards.map(async (card) => ({
      ...card,
      image_url: (await resolveBlobUrl(card.image_url)) ?? card.image_url,
    })),
  );

  if (timeline.hero_image_url && !heroResolved) {
    return null;
  }

  return {
    timeline: { ...timeline, hero_image_url: heroResolved },
    cards: resolvedCards,
  };
});

export type AdminStats = {
  totalTimelines: number;
  totalEmails: number;
  last24h: number;
  last7d: number;
};

export type AdminTimelineRow = {
  slug: string;
  dedicated_to: string;
  creator_name: string | null;
  creator_email: string | null;
  view_count: number;
  created_at: string;
};

export async function getAdminStats(): Promise<AdminStats | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql`
    select
      count(*)::int as total_timelines,
      count(creator_email)::int as total_emails,
      count(*) filter (where created_at >= now() - interval '24 hours')::int as last_24h,
      count(*) filter (where created_at >= now() - interval '7 days')::int as last_7d
    from timelines
  `;

  const row = rows[0] as
    | { total_timelines: number; total_emails: number; last_24h: number; last_7d: number }
    | undefined;
  if (!row) return null;

  return {
    totalTimelines: row.total_timelines,
    totalEmails: row.total_emails,
    last24h: row.last_24h,
    last7d: row.last_7d,
  };
}

export async function getRecentTimelinesForAdmin(limit = 50): Promise<AdminTimelineRow[]> {
  const sql = getSql();
  if (!sql) return [];

  const rows = await sql`
    select slug, dedicated_to, creator_name, creator_email, view_count, created_at
    from timelines
    order by created_at desc
    limit ${limit}
  `;

  return rows as AdminTimelineRow[];
}
