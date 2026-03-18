"use client";

import type { Dispatch, SetStateAction } from "react";

import type { DraftTimeline } from "@/components/builder/builder";

type StepFinaleProps = {
  draft: DraftTimeline;
  setDraft: Dispatch<SetStateAction<DraftTimeline>>;
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
};

export function StepFinale({ draft, setDraft, onNext, onBack, canContinue }: StepFinaleProps) {
  const remaining = 500 - draft.final_message.length;

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 3</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Write your closing message</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">This appears on the final full-screen bloom moment.</p>

      <div className="mt-6 space-y-4">
        <textarea
          value={draft.final_message}
          maxLength={500}
          onChange={(e) => setDraft((prev) => ({ ...prev, final_message: e.target.value }))}
          placeholder="Write a closing message..."
          className="min-h-[180px] w-full rounded-xl border border-[#E8D5C0] bg-white/70 px-4 py-3 font-['Lora'] text-[#1C1008] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40"
        />
        <p className="text-right text-xs text-[#1C1008]/60">{remaining} chars left</p>

        {draft.final_message ? (
          <p className="rounded-xl border border-[#E8D5C0] bg-white/60 p-4 font-['Playfair_Display'] text-lg italic text-[#1C1008]/80 shadow-sm">
            {draft.final_message}
          </p>
        ) : null}
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
