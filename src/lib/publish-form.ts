import type { DraftTimeline } from "@/components/builder/builder";

import { resizeIfNeeded } from "@/lib/image-resize";

/** Builds multipart body for `publishTimelineAction` (browser only). */
export async function buildPublishFormData(draft: DraftTimeline): Promise<FormData> {
  const validCards = draft.cards.filter(
    (card) => card.file && card.year.trim() !== "" && card.caption.trim() !== "",
  );

  const fd = new FormData();
  fd.append("dedicated_to", draft.dedicated_to.trim());
  fd.append("creator_name", draft.creator_name.trim());
  fd.append("final_message", draft.final_message.trim());
  fd.append("theme", draft.theme);
  fd.append("ending_effect", draft.ending_effect);

  if (draft.heroFile) {
    fd.append("hero", await resizeIfNeeded(draft.heroFile));
  }

  fd.append(
    "cardsMeta",
    JSON.stringify(
      validCards.map((c) => ({
        year: c.year.trim(),
        caption: c.caption.trim(),
        emotion_tag: c.emotion_tag ? c.emotion_tag : null,
      })),
    ),
  );

  for (let i = 0; i < validCards.length; i += 1) {
    fd.append(`cardFile_${i}`, await resizeIfNeeded(validCards[i].file!));
  }

  return fd;
}
