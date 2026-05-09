import { neon } from "@neondatabase/serverless";
import { cache } from "react";

import type { MemoryCard, Timeline, TimelinePayload } from "@/types/timeline";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
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

  return { timeline, cards };
});
