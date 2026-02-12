export type TimelineTheme = "warm" | "midnight" | "garden" | "golden";
export type EndingEffect = "petals" | "confetti" | "stars" | "sparkles";

export type Timeline = {
  id: string;
  slug: string;
  dedicated_to: string;
  creator_name: string | null;
  hero_image_url: string | null;
  final_message: string;
  theme: TimelineTheme;
  ending_effect: EndingEffect;
};

export type MemoryCard = {
  id: string;
  position: number;
  year: number;
  caption: string;
  emotion_tag: string | null;
  image_url: string;
};

export type TimelinePayload = {
  timeline: Timeline;
  cards: MemoryCard[];
};
