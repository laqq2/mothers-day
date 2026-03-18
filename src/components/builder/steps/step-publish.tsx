"use client";

import { useState } from "react";

import type { DraftTimeline } from "@/components/builder/builder";
import { publishTimeline } from "@/lib/upload";

type StepPublishProps = {
  draft: DraftTimeline;
  onBack: () => void;
  onPublished: (slug: string) => void;
};

export function StepPublish({ draft, onBack, onPublished }: StepPublishProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validCards = draft.cards.filter((card) => card.file && card.year.trim() && card.caption.trim());

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 5</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Publish and share</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">Everything looks good. Publish to generate your shareable link.</p>

      <div className="mt-6 rounded-2xl border border-[#E8D5C0] bg-white/70 p-4 text-[#1C1008] shadow-sm">
        <p><strong>For:</strong> {draft.dedicated_to || "—"}</p>
        <p><strong>Memories:</strong> {validCards.length}</p>
        <p><strong>Theme:</strong> {draft.theme}</p>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-[#E8D5C0] px-5 py-2 text-sm transition hover:bg-white">← Back</button>
        <button
          type="button"
          disabled={loading || !draft.dedicated_to.trim() || !draft.final_message.trim() || validCards.length === 0}
          onClick={async () => {
            try {
              setLoading(true);
              setError(null);
              const slug = await publishTimeline(draft);
              onPublished(slug);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Publishing failed. Please retry.");
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? "Publishing..." : "Publish my timeline"}
        </button>
      </div>
    </section>
  );
}
