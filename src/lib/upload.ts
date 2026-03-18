import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

import type { DraftTimeline } from "@/components/builder/builder";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

function getSupabaseClient() {
  if (!hasSupabase) {
    return null;
  }
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false },
  });
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

async function resizeIfNeeded(file: File): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to read image for compression"));
  });

  const maxWidth = 1200;
  if (image.width <= maxWidth) {
    URL.revokeObjectURL(imageUrl);
    return file;
  }

  const scale = maxWidth / image.width;
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error("Canvas is unavailable for image resize");
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, file.type || "image/jpeg", 0.82);
  });

  URL.revokeObjectURL(imageUrl);

  if (!blob) {
    throw new Error("Could not compress image");
  }

  return new File([blob], file.name, { type: blob.type || file.type });
}

export async function uploadImage(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const processed = await resizeIfNeeded(file);
  const { error } = await supabase.storage.from(bucket).upload(path, processed, {
    cacheControl: "3600",
    upsert: true,
    contentType: processed.type,
  });

  if (error) {
    throw new Error(error.message || "Image upload failed");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error("Could not create public URL");
  }

  return data.publicUrl;
}

export async function publishTimeline(draft: DraftTimeline): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const slug = nanoid(8);
  const bucket = "timeline-images";

  let hero_image_url: string | null = null;
  if (draft.heroFile) {
    const ext = getFileExtension(draft.heroFile);
    hero_image_url = await uploadImage(supabase, bucket, `${slug}/hero.${ext}`, draft.heroFile);
  }

  const validCards = draft.cards
    .filter((card) => card.file && card.year.trim() !== "" && card.caption.trim() !== "")
    .map((card) => ({ ...card, file: card.file as File }));

  const uploadedCards: Array<{
    position: number;
    year: number;
    caption: string;
    emotion_tag: string | null;
    image_url: string;
  }> = [];

  for (let i = 0; i < validCards.length; i += 1) {
    const card = validCards[i];
    const ext = getFileExtension(card.file);
    const image_url = await uploadImage(supabase, bucket, `${slug}/card-${i}.${ext}`, card.file);
    uploadedCards.push({
      position: i,
      year: Number(card.year),
      caption: card.caption.trim(),
      emotion_tag: card.emotion_tag || null,
      image_url,
    });
  }

  const { data: timeline, error: timelineError } = await supabase
    .from("timelines")
    .insert({
      slug,
      dedicated_to: draft.dedicated_to.trim(),
      creator_name: draft.creator_name.trim() || null,
      hero_image_url,
      final_message: draft.final_message.trim(),
      theme: draft.theme,
      ending_effect: draft.ending_effect,
    })
    .select("id")
    .single<{ id: string }>();

  if (timelineError || !timeline) {
    throw new Error(timelineError?.message || "Failed to create timeline");
  }

  const { error: cardsError } = await supabase.from("memory_cards").insert(
    uploadedCards.map((card) => ({
      timeline_id: timeline.id,
      ...card,
    })),
  );

  if (cardsError) {
    throw new Error(cardsError.message || "Failed to create memory cards");
  }

  return slug;
}
