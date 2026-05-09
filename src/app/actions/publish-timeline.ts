"use server";

import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";

const THEMES = ["warm", "midnight", "garden", "golden"] as const;
const EFFECTS = ["petals", "confetti", "stars", "sparkles"] as const;

type CardMeta = { year: string; caption: string; emotion_tag: string | null };
type PublishResult = { ok: true; slug: string } | { ok: false; error: string };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add it in .env.local and in Vercel project env.");
  return neon(url);
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[file.type] ?? "jpg";
}

export async function publishTimelineAction(formData: FormData): Promise<PublishResult> {
  try {
    const sql = getSql();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is not set. Add it in .env.local and in Vercel project env.",
      );
    }

    const dedicated_to = String(formData.get("dedicated_to") ?? "").trim();
    const creator_name = String(formData.get("creator_name") ?? "").trim();
    const final_message = String(formData.get("final_message") ?? "").trim();
    const theme = String(formData.get("theme") ?? "warm");
    const ending_effect = String(formData.get("ending_effect") ?? "petals");

    if (!dedicated_to || !final_message) {
      throw new Error("Missing required fields");
    }

    if (!THEMES.includes(theme as (typeof THEMES)[number])) {
      throw new Error("Invalid theme");
    }
    if (!EFFECTS.includes(ending_effect as (typeof EFFECTS)[number])) {
      throw new Error("Invalid ending effect");
    }

    const cardsMetaRaw = String(formData.get("cardsMeta") ?? "");
    let cardsMeta: CardMeta[];
    try {
      cardsMeta = JSON.parse(cardsMetaRaw) as CardMeta[];
    } catch {
      throw new Error("Invalid cards payload");
    }

    if (!Array.isArray(cardsMeta) || cardsMeta.length === 0) {
      throw new Error("At least one memory card is required");
    }

    const slug = nanoid(8);
    const prefix = `forevergram/${slug}`;

    let hero_image_url: string | null = null;
    const hero = formData.get("hero");
    if (hero instanceof File && hero.size > 0) {
      const ext = getFileExtension(hero);
      const blob = await put(`${prefix}/hero.${ext}`, hero, {
        access: "private",
        token,
        contentType: hero.type || `image/${ext}`,
      });
      hero_image_url = blob.pathname;
    }

    const imagePaths: string[] = [];
    for (let i = 0; i < cardsMeta.length; i += 1) {
      const file = formData.get(`cardFile_${i}`);
      if (!(file instanceof File) || file.size === 0) {
        throw new Error(`Missing image for card ${i + 1}`);
      }
      const ext = getFileExtension(file);
      const uploaded = await put(`${prefix}/card-${i}.${ext}`, file, {
        access: "private",
        token,
        contentType: file.type || `image/${ext}`,
      });
      imagePaths.push(uploaded.pathname);
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
      ${hero_image_url},
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

    for (let i = 0; i < cardsMeta.length; i += 1) {
      const meta = cardsMeta[i];
      const yearNum = Number.parseInt(meta.year, 10);
      if (Number.isNaN(yearNum)) {
        throw new Error(`Invalid year for card ${i + 1}`);
      }
      await sql`
      insert into memory_cards (timeline_id, position, year, caption, emotion_tag, image_url)
      values (
        ${timelineId},
        ${i},
        ${yearNum},
        ${meta.caption.trim()},
        ${meta.emotion_tag},
        ${imagePaths[i]}
      )
    `;
    }

    return { ok: true, slug };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Publish failed. Check DATABASE_URL, BLOB_READ_WRITE_TOKEN, and Neon schema.";
    return { ok: false, error: message };
  }
}
