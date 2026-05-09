"use client";

import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { StepCustomise } from "@/components/builder/steps/step-customise";
import { StepDedication } from "@/components/builder/steps/step-dedication";
import { StepFinale } from "@/components/builder/steps/step-finale";
import { StepMemories } from "@/components/builder/steps/step-memories";
import { StepPublish } from "@/components/builder/steps/step-publish";
import type { EndingEffect, TimelineTheme } from "@/types/timeline";

const STORAGE_KEY = "ltt-draft";

export type DraftCard = {
  localId: string;
  file: File | null;
  previewUrl: string;
  year: string;
  caption: string;
  emotion_tag: string;
};

export type DraftTimeline = {
  dedicated_to: string;
  creator_name: string;
  heroFile: File | null;
  heroPreviewUrl: string;
  cards: DraftCard[];
  final_message: string;
  theme: TimelineTheme;
  ending_effect: EndingEffect;
};

type DraftTimelineStored = Omit<DraftTimeline, "heroFile" | "cards"> & {
  heroFile: null;
  cards: Array<Omit<DraftCard, "file"> & { file: null }>;
};

const STEP_LABELS = [
  "Who is this for",
  "Memories",
  "Closing message",
  "Style",
  "Share",
] as const;

function createBlankCard(): DraftCard {
  return {
    localId: nanoid(),
    file: null,
    previewUrl: "",
    year: "",
    caption: "",
    emotion_tag: "",
  };
}

const DEFAULT_DRAFT: DraftTimeline = {
  dedicated_to: "",
  creator_name: "",
  heroFile: null,
  heroPreviewUrl: "",
  cards: [createBlankCard()],
  final_message: "",
  theme: "warm",
  ending_effect: "petals",
};

export function Builder() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [draft, setDraft] = useState<DraftTimeline>(DEFAULT_DRAFT);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<DraftTimelineStored>;
      setDraft({
        dedicated_to: parsed.dedicated_to ?? "",
        creator_name: parsed.creator_name ?? "",
        heroFile: null,
        heroPreviewUrl: parsed.heroPreviewUrl ?? "",
        cards:
          parsed.cards?.length
            ? parsed.cards.map((card) => ({
                localId: card.localId ?? nanoid(),
                file: null,
                previewUrl: card.previewUrl ?? "",
                year: card.year ?? "",
                caption: card.caption ?? "",
                emotion_tag: card.emotion_tag ?? "",
              }))
            : [createBlankCard()],
        final_message: parsed.final_message ?? "",
        theme: (parsed.theme as TimelineTheme) ?? "warm",
        ending_effect: (parsed.ending_effect as EndingEffect) ?? "petals",
      });
    } catch {
      // no-op on malformed storage
    }
  }, []);

  useEffect(() => {
    const serializable: DraftTimelineStored = {
      ...draft,
      heroFile: null,
      cards: draft.cards.map((card) => ({ ...card, file: null })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [draft]);

  const completedStep = useMemo(() => {
    const hasValidMemory = draft.cards.some(
      (card) => Boolean(card.file) && card.year.trim() !== "" && card.caption.trim() !== "",
    );

    return [
      draft.dedicated_to.trim() !== "",
      hasValidMemory,
      draft.final_message.trim() !== "",
      true,
      true,
    ];
  }, [draft]);

  const goToStep = (next: number) => {
    if (next < 0 || next > 4) return;
    if (!visitedSteps.includes(next)) return;
    setStep(next);
  };

  const goNext = () => {
    if (step >= 4) return;
    const next = step + 1;
    setVisitedSteps((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setStep(next);
  };

  const goBack = () => {
    if (step <= 0) return;
    setStep(step - 1);
  };

  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDraft(DEFAULT_DRAFT);
  };

  return (
    <main className="min-h-screen bg-[#FBF6EF] bg-[radial-gradient(circle_at_20%_0%,rgba(196,113,74,0.12),transparent_35%),radial-gradient(circle_at_100%_10%,rgba(196,113,74,0.08),transparent_25%)]">
      <div className="mx-auto w-full max-w-xl px-5 py-12">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/forevergram-logo.png"
            alt="Forevergram logo"
            className="h-10 w-10 rounded-lg border border-[#1C1008]/10 bg-white/60 p-1 object-cover"
          />
          <div>
            <p className="font-['Playfair_Display'] text-xl text-[#1C1008]">Forevergram</p>
            <p className="font-['DM_Sans'] text-[11px] uppercase tracking-[0.18em] text-[#1C1008]/45">
              Build your timeline
            </p>
          </div>
        </div>
        <div className="mb-10 grid grid-cols-5 gap-2">
          {STEP_LABELS.map((label, idx) => {
            const isActive = idx === step;
            const visited = visitedSteps.includes(idx);
            return (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(idx)}
                disabled={!visited}
                className="text-left transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="mb-2 h-1.5 rounded-full bg-[#E8D5C0]/90">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: isActive || idx < step ? "100%" : "0%",
                      backgroundColor: "#C4714A",
                    }}
                  />
                </div>
                <span
                  className="font-['DM_Sans'] text-[10px] uppercase tracking-[0.12em] transition-colors"
                  style={{ color: visited ? "#1C1008" : "rgba(28,16,8,0.4)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-[#E8D5C0]/70 bg-white/50 p-6 shadow-[0_14px_50px_rgba(121,78,45,0.12)] backdrop-blur-sm sm:p-8"
          >
            {step === 0 ? (
              <StepDedication draft={draft} setDraft={setDraft} onNext={goNext} canContinue={completedStep[0]} />
            ) : null}
            {step === 1 ? (
              <StepMemories
                draft={draft}
                setDraft={setDraft}
                onNext={goNext}
                onBack={goBack}
                canContinue={completedStep[1]}
              />
            ) : null}
            {step === 2 ? (
              <StepFinale
                draft={draft}
                setDraft={setDraft}
                onNext={goNext}
                onBack={goBack}
                canContinue={completedStep[2]}
              />
            ) : null}
            {step === 3 ? (
              <StepCustomise draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />
            ) : null}
            {step === 4 ? (
              <StepPublish
                draft={draft}
                onBack={goBack}
                onPublished={(slug) => {
                  clearDraft();
                  router.push(`/t/${slug}`);
                }}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
