import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";

import type { DraftTimeline } from "@/components/builder/builder";
import { resizeIfNeeded } from "@/lib/image-resize";

export type PublishCardInput = {
  year: string;
  caption: string;
  emotion_tag: string | null;
  image_url: string;
};

export type PublishInput = {
  slug: string;
  dedicated_to: string;
  creator_name: string;
  final_message: string;
  theme: DraftTimeline["theme"];
  ending_effect: DraftTimeline["ending_effect"];
  hero_image_url: string | null;
  cards: PublishCardInput[];
};

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function pickExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "jpeg") return "jpg";
  if (fromName && /^[a-z0-9]{2,4}$/.test(fromName) && EXTENSION_MAP[`image/${fromName === "jpg" ? "jpeg" : fromName}`]) {
    return fromName;
  }
  return EXTENSION_MAP[file.type] ?? "jpg";
}

async function uploadFile(pathname: string, file: File): Promise<string> {
  const blob = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/upload-token",
    contentType: file.type || "image/jpeg",
  });
  return blob.pathname;
}

/**
 * Resizes (if needed) and uploads every draft asset directly to Vercel Blob from
 * the browser, then returns the JSON payload to hand to `publishTimelineAction`.
 *
 * This bypasses Vercel's 4.5MB server-action body limit — files never go through
 * our serverless function as multipart data.
 */
export async function uploadDraftAndBuildPayload(draft: DraftTimeline): Promise<PublishInput> {
  const slug = nanoid(8);
  const prefix = `forevergram/${slug}`;

  const validCards = draft.cards.filter(
    (card) => card.file && card.year.trim() !== "" && card.caption.trim() !== "",
  );

  let hero_image_url: string | null = null;
  if (draft.heroFile) {
    const resized = await resizeIfNeeded(draft.heroFile);
    const ext = pickExtension(resized);
    hero_image_url = await uploadFile(`${prefix}/hero.${ext}`, resized);
  }

  const cards: PublishCardInput[] = [];
  for (let i = 0; i < validCards.length; i += 1) {
    const card = validCards[i];
    if (!card.file) continue;
    const resized = await resizeIfNeeded(card.file);
    const ext = pickExtension(resized);
    const path = await uploadFile(`${prefix}/card-${i}.${ext}`, resized);
    cards.push({
      year: card.year.trim(),
      caption: card.caption.trim(),
      emotion_tag: card.emotion_tag ? card.emotion_tag : null,
      image_url: path,
    });
  }

  return {
    slug,
    dedicated_to: draft.dedicated_to.trim(),
    creator_name: draft.creator_name.trim(),
    final_message: draft.final_message.trim(),
    theme: draft.theme,
    ending_effect: draft.ending_effect,
    hero_image_url,
    cards,
  };
}
