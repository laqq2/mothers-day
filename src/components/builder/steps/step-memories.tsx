"use client";

import { nanoid } from "nanoid";
import type { Dispatch, SetStateAction } from "react";

import type { DraftCard, DraftTimeline } from "@/components/builder/builder";

const EMOTIONS = ["love", "funny", "proud", "grateful", "nostalgic"];

type StepMemoriesProps = {
  draft: DraftTimeline;
  setDraft: Dispatch<SetStateAction<DraftTimeline>>;
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
};

function blankCard(): DraftCard {
  return {
    localId: nanoid(),
    file: null,
    previewUrl: "",
    year: "",
    caption: "",
    emotion_tag: "",
  };
}

export function StepMemories({ draft, setDraft, onNext, onBack, canContinue }: StepMemoriesProps) {
  const revokeIfBlob = (url: string | undefined) => {
    if (typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const updateCard = (localId: string, patch: Partial<DraftCard>) => {
    setDraft((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => (card.localId === localId ? { ...card, ...patch } : card)),
    }));
  };

  const setCardFile = (card: DraftCard, file: File) => {
    revokeIfBlob(card.previewUrl);
    updateCard(card.localId, { file, previewUrl: URL.createObjectURL(file) });
  };

  const clearCardFile = (card: DraftCard) => {
    revokeIfBlob(card.previewUrl);
    updateCard(card.localId, { file: null, previewUrl: "" });
  };

  const moveCard = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= draft.cards.length) return;
    setDraft((prev) => {
      const cards = [...prev.cards];
      [cards[index], cards[target]] = [cards[target], cards[index]];
      return { ...prev, cards };
    });
  };

  const removeCard = (card: DraftCard) => {
    if (card.caption.trim() !== "" && !window.confirm("Delete this memory?")) {
      return;
    }
    setDraft((prev) => {
      const cards = prev.cards.filter((item) => item.localId !== card.localId);
      return { ...prev, cards: cards.length ? cards : [blankCard()] };
    });
  };

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 2</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Add your memories</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">Each memory becomes one cinematic moment in the viewer.</p>

      <div className="mt-6 space-y-5">
        {draft.cards.map((card, index) => {
          const remaining = 280 - card.caption.length;
          return (
            <article key={card.localId} className="rounded-2xl border border-[#E8D5C0] bg-white/70 p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Memory {index + 1}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveCard(index, -1)} className="rounded border border-[#E8D5C0] px-2 py-1 text-sm transition hover:bg-white">↑</button>
                  <button type="button" onClick={() => moveCard(index, 1)} className="rounded border border-[#E8D5C0] px-2 py-1 text-sm transition hover:bg-white">↓</button>
                  <button type="button" onClick={() => removeCard(card)} className="rounded border border-[#E8D5C0] px-2 py-1 text-sm transition hover:bg-white">✕</button>
                </div>
              </div>

              <label className="inline-flex cursor-pointer rounded-full bg-[#C4714A] px-5 py-2 text-xs font-semibold text-white transition hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(196,113,74,0.3)]">
                {card.file ? "Replace photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    setCardFile(card, file);
                  }}
                />
              </label>

              {card.previewUrl ? (
                <img
                  src={card.previewUrl}
                  alt="Memory preview"
                  className="mt-3 h-[180px] w-full rounded-xl object-cover"
                  onError={() => clearCardFile(card)}
                />
              ) : null}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={card.year}
                  onChange={(e) => updateCard(card.localId, { year: e.target.value })}
                  type="number"
                  min={1900}
                  max={2026}
                  placeholder="Year"
                  className="w-full rounded-xl border border-[#E8D5C0] bg-white/70 px-4 py-3 font-['Lora'] text-[#1C1008] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {EMOTIONS.map((emotion) => {
                    const selected = card.emotion_tag === emotion;
                    return (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => updateCard(card.localId, { emotion_tag: selected ? "" : emotion })}
                        className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.08em]"
                        style={{
                          borderColor: selected ? "#C4714A" : "#E8D5C0",
                          backgroundColor: selected ? "#C4714A" : "transparent",
                          color: selected ? "white" : "#1C1008",
                        }}
                      >
                        {emotion}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3">
                <textarea
                  value={card.caption}
                  maxLength={280}
                  onChange={(e) => updateCard(card.localId, { caption: e.target.value })}
                  placeholder="Write this memory..."
                  className="min-h-[100px] w-full rounded-xl border border-[#E8D5C0] bg-white/70 px-4 py-3 font-['Lora'] text-[#1C1008] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40"
                />
                <p className="mt-1 text-right text-xs text-[#1C1008]/60">{remaining} chars left</p>
              </div>
            </article>
          );
        })}

        {draft.cards.length >= 8 ? (
          <p className="rounded-xl border border-[#E8D5C0] bg-white/70 p-3 text-sm text-[#1C1008]/80">
            Free tier limit reached (8 memories).
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setDraft((prev) => ({ ...prev, cards: [...prev.cards, blankCard()] }))}
            className="rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(196,113,74,0.35)]"
          >
            Add memory
          </button>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-[#E8D5C0] px-5 py-2 text-sm transition hover:bg-white">← Back</button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Continue →
        </button>
      </div>
    </section>
  );
}
