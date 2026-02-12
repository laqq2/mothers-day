"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

import type { EndingEffect } from "@/types/timeline";

type FinaleEffectsProps = {
  effect: EndingEffect;
  accent: string;
};

export function FinaleEffects({ effect, accent }: FinaleEffectsProps) {
  useEffect(() => {
    const duration = 2200;
    const end = Date.now() + duration;

    const fire = () => {
      const common = {
        spread: 80,
        ticks: 150,
        gravity: 0.8,
      };

      if (effect === "confetti") {
        confetti({ ...common, particleCount: 90, origin: { y: 0.6 } });
      } else if (effect === "petals") {
        confetti({
          ...common,
          particleCount: 70,
          scalar: 1.2,
          colors: [accent, "#fce7f3", "#fde68a", "#fff1f2"],
          shapes: ["circle"],
        });
      } else if (effect === "stars") {
        confetti({ ...common, particleCount: 70, shapes: ["star"], colors: [accent, "#fff"] });
      } else {
        confetti({ ...common, particleCount: 120, scalar: 0.7, colors: [accent, "#ffffff"] });
      }
    };

    const timer = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(timer);
        return;
      }
      fire();
    }, 250);

    return () => clearInterval(timer);
  }, [accent, effect]);

  return null;
}
