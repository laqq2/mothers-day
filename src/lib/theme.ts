import type { TimelineTheme } from "@/types/timeline";

export const THEME_MAP: Record<
  TimelineTheme,
  {
    bg: string;
    text: string;
    accent: string;
    spine: string;
    wash: string;
    cardBg: string;
  }
> = {
  warm: {
    bg: "#FBF6EF",
    text: "#1C1008",
    accent: "#C4714A",
    spine: "#E8D5C0",
    wash: "rgba(196, 113, 74, 0.12)",
    cardBg: "rgba(255,255,255,0.68)",
  },
  midnight: {
    bg: "#0F0F18",
    text: "#F0EEF8",
    accent: "#9B7FEA",
    spine: "#2A2A40",
    wash: "rgba(155, 127, 234, 0.12)",
    cardBg: "rgba(27,27,40,0.7)",
  },
  garden: {
    bg: "#F1F7F1",
    text: "#1A2B1E",
    accent: "#4A7C59",
    spine: "#C8DEC8",
    wash: "rgba(74, 124, 89, 0.12)",
    cardBg: "rgba(255,255,255,0.72)",
  },
  golden: {
    bg: "#1A1008",
    text: "#FAF0DC",
    accent: "#E8B84B",
    spine: "#3A2A10",
    wash: "rgba(232, 184, 75, 0.12)",
    cardBg: "rgba(43,30,19,0.74)",
  },
};
