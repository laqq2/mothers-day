"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Is it really free?",
    a: "Yes. Creating and sharing a timeline is completely free. No credit card, no account.",
  },
  {
    q: "How long does it take?",
    a: "Most people finish in under 5 minutes. You can save your progress and come back anytime.",
  },
  {
    q: "Can she view it on her phone?",
    a: "Absolutely — it's designed for mobile first. The link opens in any browser, no app needed.",
  },
  {
    q: "Can I edit it after publishing?",
    a: "Not yet — editing after publish is coming soon. For now, take a moment to preview before you share.",
  },
  {
    q: "What happens to my photos?",
    a: "Your photos are stored securely and only accessible via your unique link. We don't use them for anything else.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="mb-12 font-['Playfair_Display'] text-4xl text-[#1C1008]">Questions</h2>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <article key={item.q} className="rounded-2xl border border-[#E8D5C0] bg-white/50 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-['DM_Sans'] font-semibold text-[#1C1008]">{item.q}</span>
                <span className="text-xl text-[#C4714A]">{isOpen ? "−" : "+"}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 font-['Lora'] text-sm leading-relaxed text-[#1C1008]/70">{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
}
