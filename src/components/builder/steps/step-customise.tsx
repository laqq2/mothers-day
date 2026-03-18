"use client";

import type { Dispatch, SetStateAction } from "react";

import type { DraftTimeline } from "@/components/builder/builder";
import { THEME_MAP } from "@/lib/theme";

const themeLabels: Array<{ key: DraftTimeline["theme"]; label: string }> = [
  { key: "warm", label: "Warm" },
  { key: "midnight", label: "Midnight" },
  { key: "garden", label: "Garden" },
  { key: "golden", label: "Golden Hour" },
];

const effectLabels: Array<{ key: DraftTimeline["ending_effect"]; label: string }> = [
  { key: "petals", label: "Petals" },
  { key: "confetti", label: "Confetti" },
  { key: "stars", label: "Stars" },
  { key: "sparkles", label: "Sparkles" },
];

type StepCustomiseProps = {
  draft: DraftTimeline;
  setDraft: Dispatch<SetStateAction<DraftTimeline>>;
  onNext: () => void;
  onBack: () => void;
};

export function StepCustomise({ draft, setDraft, onBack, onNext }: StepCustomiseProps) {
  const activeTheme = THEME_MAP[draft.theme];

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 4</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Choose your style</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">Pick a color world and ending vibe for the timeline.</p>

      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Theme</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {themeLabels.map((item) => {
              const t = THEME_MAP[item.key];
              const active = item.key === draft.theme;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, theme: item.key }))}
                  className="text-left transition-transform hover:translate-y-[-2px]"
                >
                  <span
                    className="block h-16 w-16 rounded-2xl border shadow-sm"
                    style={{
                      backgroundColor: t.bg,
                      borderColor: t.accent,
                      boxShadow: active ? `0 0 0 3px ${t.accent}55` : "none",
                    }}
                  />
                  <span className="mt-1 block text-xs text-[#1C1008]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Ending effect</p>
          <div className="flex flex-wrap gap-2">
            {effectLabels.map((item) => {
              const active = item.key === draft.ending_effect;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, ending_effect: item.key }))}
                  className="rounded-full border px-4 py-1.5 text-sm"
                  style={{
                    borderColor: active ? activeTheme.accent : "#E8D5C0",
                    backgroundColor: active ? activeTheme.accent : "transparent",
                    color: active ? "white" : "#1C1008",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Preview</p>
          <div
            className="h-[180px] w-[280px] rounded-2xl border p-4 shadow-sm"
            style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.spine, color: activeTheme.text }}
          >
            <p className="font-['Playfair_Display'] text-2xl">for {draft.dedicated_to || "Mum"}</p>
            <p className="mt-8 font-['Playfair_Display'] text-5xl" style={{ color: activeTheme.accent }}>
              2003
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-[#E8D5C0] px-5 py-2 text-sm transition hover:bg-white">← Back</button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Continue →
        </button>
      </div>
    </section>
  );
}
