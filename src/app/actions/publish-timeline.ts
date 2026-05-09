"use server";

import { neon } from "@neondatabase/serverless";

import type { PublishInput } from "@/lib/publish-client";

const THEMES = ["warm", "midnight", "garden", "golden"] as const;
const EFFECTS = ["petals", "confetti", "stars", "sparkles"] as const;

type PublishResult = { ok: true; slug: string } | { ok: false; error: string };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add it in .env.local and in Vercel project env.");
  return neon(url);
}

const SLUG_PATTERN = /^[A-Za-z0-9_-]{6,16}$/;
const ALLOWED_PATH = /^[A-Za-z0-9][A-Za-z0-9_/.-]{2,127}$/;

function isValidBlobPath(path: string) {
  return ALLOWED_PATH.test(path) && !path.includes("..");
}

export async function publishTimelineAction(input: PublishInput): Promise<PublishResult> {
  try {
    const sql = getSql();

    if (!input || typeof input !== "object") {
      throw new Error("Missing payload");
    }

    const slug = String(input.slug ?? "").trim();
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error("Invalid slug");
    }

    const dedicated_to = String(input.dedicated_to ?? "").trim();
    const creator_name = String(input.creator_name ?? "").trim();
    const final_message = String(input.final_message ?? "").trim();
    const theme = String(input.theme ?? "warm");
    const ending_effect = String(input.ending_effect ?? "petals");

    if (!dedicated_to || !final_message) {
      throw new Error("Missing required fields");
    }

    if (!THEMES.includes(theme as (typeof THEMES)[number])) {
      throw new Error("Invalid theme");
    }
    if (!EFFECTS.includes(ending_effect as (typeof EFFECTS)[number])) {
      throw new Error("Invalid ending effect");
    }

    if (!Array.isArray(input.cards) || input.cards.length === 0) {
      throw new Error("At least one memory card is required");
    }

    if (input.hero_image_url && !isValidBlobPath(input.hero_image_url)) {
      throw new Error("Invalid hero image reference");
    }

    for (let i = 0; i < input.cards.length; i += 1) {
      const card = input.cards[i];
      if (!card || !card.image_url || !isValidBlobPath(card.image_url)) {
        throw new Error(`Missing or invalid image for memory ${i + 1}`);
      }
      if (!card.year?.toString().trim() || !card.caption?.toString().trim()) {
        throw new Error(`Missing details for memory ${i + 1}`);
      }
    }

    const timelineRows = await sql`
      insert into timelines (
        slug,
        dedicated_to,
        creator_name,
        hero_image_url,
        final_message,
        theme,
        ending_effect
      )
      values (
        ${slug},
        ${dedicated_to},
        ${creator_name || null},
        ${input.hero_image_url ?? null},
        ${final_message},
        ${theme},
        ${ending_effect}
      )
      returning id
    `;

    const timelineId = timelineRows[0]?.id as string | undefined;
    if (!timelineId) {
      throw new Error("Failed to create timeline");
    }

    for (let i = 0; i < input.cards.length; i += 1) {
      const card = input.cards[i];
      const yearNum = Number.parseInt(card.year, 10);
      if (Number.isNaN(yearNum)) {
        throw new Error(`Invalid year for memory ${i + 1}`);
      }
      await sql`
        insert into memory_cards (timeline_id, position, year, caption, emotion_tag, image_url)
        values (
          ${timelineId},
          ${i},
          ${yearNum},
          ${card.caption.trim()},
          ${card.emotion_tag ?? null},
          ${card.image_url}
        )
      `;
    }

    return { ok: true, slug };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Publish failed. Please retry.";
    return { ok: false, error: message };
  }
}
