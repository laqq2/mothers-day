"use client";

import type { Dispatch, SetStateAction } from "react";

import type { DraftTimeline } from "@/components/builder/builder";

type StepDedicationProps = {
  draft: DraftTimeline;
  setDraft: Dispatch<SetStateAction<DraftTimeline>>;
  onNext: () => void;
  canContinue: boolean;
};

export function StepDedication({ draft, setDraft, onNext, canContinue }: StepDedicationProps) {
  const onHeroFile = (file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDraft((prev) => ({ ...prev, heroFile: file, heroPreviewUrl: previewUrl }));
  };

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 1</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Who is this timeline for?</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">Start with the dedication and optional cover to set the tone.</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">
            This timeline is for...
          </label>
          <input
            value={draft.dedicated_to}
            onChange={(e) => setDraft((prev) => ({ ...prev, dedicated_to: e.target.value }))}
            placeholder="Mum"
            className="w-full rounded-xl border border-[#E8D5C0] bg-white/70 px-4 py-3 font-['Lora'] text-[#1C1008] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40"
          />
        </div>

        <div>
          <label className="mb-2 block font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">
            Your name (optional)
          </label>
          <input
            value={draft.creator_name}
            onChange={(e) => setDraft((prev) => ({ ...prev, creator_name: e.target.value }))}
            className="w-full rounded-xl border border-[#E8D5C0] bg-white/70 px-4 py-3 font-['Lora'] text-[#1C1008] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40"
          />
        </div>

        <div>
          <label className="mb-2 block font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Hero photo</label>
          <label className="inline-flex cursor-pointer rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(196,113,74,0.35)]">
            Upload a cover photo (optional)
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onHeroFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {draft.heroPreviewUrl ? (
            <div className="relative mt-4 overflow-hidden rounded-xl border border-[#E8D5C0] bg-white/70 shadow-sm">
              <img src={draft.heroPreviewUrl} alt="Hero preview" className="h-[200px] w-full object-cover" />
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, heroFile: null, heroPreviewUrl: "" }))}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white transition hover:bg-black/90"
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
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
