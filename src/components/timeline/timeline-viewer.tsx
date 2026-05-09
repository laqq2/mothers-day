"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { FinaleEffects } from "@/components/timeline/finale-effects";
import { THEME_MAP } from "@/lib/theme";
import type { TimelinePayload } from "@/types/timeline";

type TimelineViewerProps = {
  payload: TimelinePayload;
};

// Tunes typography + animation pacing to message length so a 500-char closing
// note still fits a small phone viewport without overflow.
function pickFinaleSizing(messageLength: number) {
  if (messageLength > 320) {
    return {
      heading: "text-base sm:text-2xl md:text-3xl",
      leading: "leading-snug",
      stagger: 0.014,
    };
  }
  if (messageLength > 180) {
    return {
      heading: "text-lg sm:text-3xl md:text-4xl",
      leading: "leading-snug",
      stagger: 0.022,
    };
  }
  return {
    heading: "text-2xl sm:text-4xl md:text-5xl",
    leading: "leading-snug sm:leading-tight",
    stagger: 0.032,
  };
}

export function TimelineViewer({ payload }: TimelineViewerProps) {
  const { timeline, cards } = payload;
  const theme = THEME_MAP[timeline.theme];
  const prefersReducedMotion = useReducedMotion();
  const [showFinale, setShowFinale] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [eagerCardIndices, setEagerCardIndices] = useState<number[]>([0]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hero = useMemo(() => {
    if (timeline.hero_image_url) {
      return timeline.hero_image_url;
    }
    return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80";
  }, [timeline.hero_image_url]);

  const totalSlides = cards.length + 2;
  const finaleSizing = useMemo(
    () => pickFinaleSizing(timeline.final_message.length),
    [timeline.final_message],
  );
  const finaleWords = useMemo(
    () => timeline.final_message.split(/\s+/).filter(Boolean),
    [timeline.final_message],
  );

  const finaleHeadingVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          delayChildren: 0.08,
          staggerChildren: prefersReducedMotion ? 0 : finaleSizing.stagger,
        },
      },
    }),
    [finaleSizing.stagger, prefersReducedMotion],
  );

  const finaleWordVariants: Variants = useMemo(
    () => ({
      hidden: prefersReducedMotion
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 10, filter: "blur(3px)" },
      visible: prefersReducedMotion
        ? { opacity: 1, y: 0 }
        : {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.45, ease: "easeOut" },
          },
    }),
    [prefersReducedMotion],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLElement).dataset.slideIndex ?? "0");
          setCurrentSlide(idx);

          if (idx < cards.length) {
            setEagerCardIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
          }
        });
      },
      { threshold: 0.6 },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [cards.length]);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const flashShareStatus = (message: string) => {
    setShareStatus(message);
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareStatus(null), 2600);
  };

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };

  const buildShareText = () =>
    `I made this for ${timeline.dedicated_to} on Forevergram — watch it here:`;

  const handleNativeShare = async () => {
    const url = buildShareUrl();
    if (!url) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `A timeline for ${timeline.dedicated_to}`,
          text: buildShareText(),
          url,
        });
        return;
      }
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      if (aborted) return;
    }
    await handleCopyLink();
  };

  const handleCopyLink = async () => {
    const url = buildShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      flashShareStatus("Link copied — paste it into Messages or WhatsApp");
    } catch {
      flashShareStatus("Couldn't copy automatically. Long-press the address bar to copy.");
    }
  };

  const handleWhatsAppShare = () => {
    const url = buildShareUrl();
    if (!url) return;
    const text = encodeURIComponent(`${buildShareText()} ${url}`);
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const nextKey = key === "arrowdown" || key === "j";
      const prevKey = key === "arrowup" || key === "k";
      if (!nextKey && !prevKey) return;

      event.preventDefault();
      const nextIndex = nextKey
        ? Math.min(currentSlide + 1, totalSlides - 1)
        : Math.max(currentSlide - 1, 0);
      slideRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentSlide, totalSlides]);

  return (
    <div
      className="relative overflow-x-hidden"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        height: "100dvh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        overscrollBehavior: "contain",
      }}
    >
      {/* Hero slide */}
      <section
        ref={(el) => {
          slideRefs.current[0] = el;
        }}
        data-slide-index={0}
        className="relative h-[100dvh] shrink-0 snap-start overflow-hidden bg-black"
      >
        <Image
          src={hero}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover scale-110 blur-2xl opacity-60"
        />
        <Image
          src={hero}
          alt={`Hero image for ${timeline.dedicated_to}`}
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <div
          className="absolute inset-x-0 z-10 px-6 sm:px-10"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        >
          <motion.img
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            src="/forevergram-logo.png"
            alt="Forevergram logo"
            className="mb-3 h-11 w-11 rounded-lg border border-white/30 bg-white/80 p-1 object-cover sm:h-12 sm:w-12"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-2 font-['DM_Sans'] text-[11px] uppercase tracking-[0.22em] text-white/80 sm:text-xs"
          >
            Forevergram
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.9, ease: "easeOut" }}
            className="max-w-3xl font-['Playfair_Display'] text-[2rem] leading-tight text-white sm:text-[44px] md:text-[52px]"
          >
            {timeline.dedicated_to}
          </motion.h1>
          {timeline.creator_name ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.7, ease: "easeOut" }}
              className="mt-3 font-['DM_Sans'] text-sm text-white/80"
            >
              Made with love by {timeline.creator_name}
            </motion.p>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/90"
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <span className="animate-bounce text-2xl">↓</span>
          <span className="font-['DM_Sans'] text-[10px] uppercase tracking-[0.2em] sm:text-xs">
            Swipe up
          </span>
        </motion.div>
      </section>

      {/* Memory card slides */}
      {cards.map((card, index) => {
        const globalSlideIndex = index + 1;
        const progress = ((index + 1) / cards.length) * 100;
        const eager = index === 0 || eagerCardIndices.includes(index);

        return (
          <section
            key={card.id}
            ref={(el) => {
              slideRefs.current[globalSlideIndex] = el;
            }}
            data-slide-index={globalSlideIndex}
            className="relative h-[100dvh] shrink-0 snap-start overflow-hidden bg-black"
          >
            <div
              className="absolute left-0 top-0 z-20 h-[2px] opacity-70"
              style={{ width: `${progress}%`, backgroundColor: theme.accent }}
            />
            <Image
              src={card.image_url}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              priority={index === 0}
              loading={index === 0 ? undefined : eager ? "eager" : "lazy"}
              unoptimized
              className="object-cover scale-110 blur-2xl opacity-55"
            />
            <Image
              src={card.image_url}
              alt={card.caption}
              fill
              sizes="100vw"
              priority={index === 0}
              loading={index === 0 ? undefined : eager ? "eager" : "lazy"}
              unoptimized
              className="object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/[0.88] via-black/45 to-transparent px-5 pt-8 sm:px-8 sm:pt-10"
              style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
            >
              <p
                className="font-['Playfair_Display'] text-[44px] leading-none sm:text-[64px] md:text-[80px]"
                style={{ color: theme.accent }}
              >
                {card.year}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                {card.caption}
              </p>
              {card.emotion_tag ? (
                <span
                  className="mt-3 inline-flex rounded-full border px-3 py-1 font-['DM_Sans'] text-[10px] uppercase tracking-[0.12em] sm:text-xs"
                  style={{ borderColor: `${theme.accent}88`, color: theme.accent }}
                >
                  {card.emotion_tag}
                </span>
              ) : null}
            </motion.div>

            <div
              className="absolute right-4 z-20 flex flex-col items-center gap-4 text-white/90"
              style={{ bottom: "calc(8rem + env(safe-area-inset-bottom))" }}
            >
              <span className="font-['DM_Sans'] text-xs tracking-[0.14em]">
                {index + 1}/{cards.length}
              </span>
              <span style={{ color: theme.accent }} className="text-xl">
                ♥
              </span>
            </div>
          </section>
        );
      })}

      {/* Finale slide */}
      <section
        ref={(el) => {
          slideRefs.current[totalSlides - 1] = el;
        }}
        data-slide-index={totalSlides - 1}
        className="relative flex h-[100dvh] shrink-0 snap-start flex-col items-center justify-center overflow-hidden px-5 py-8 text-center sm:px-8 sm:py-14"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 font-['DM_Sans'] text-[10px] uppercase tracking-[0.2em] sm:mb-5 sm:text-xs"
            style={{ color: theme.accent }}
          >
            Final message
          </motion.p>

          <motion.h2
            onViewportEnter={() => setShowFinale(true)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={finaleHeadingVariants}
            className={`font-['Playfair_Display'] ${finaleSizing.heading} ${finaleSizing.leading}`}
          >
            {finaleWords.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                variants={finaleWordVariants}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-7 flex w-full flex-col items-center gap-3 sm:mt-12 sm:gap-4"
          >
            <p
              className="font-['DM_Sans'] text-[10px] uppercase tracking-[0.2em] sm:text-xs"
              style={{ color: theme.accent }}
            >
              Send this to {timeline.dedicated_to}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="rounded-full px-5 py-2.5 font-['DM_Sans'] text-xs font-semibold text-white shadow-lg shadow-black/10 transition hover:scale-[1.03] sm:px-6 sm:text-sm"
                style={{ backgroundColor: theme.accent }}
              >
                {canNativeShare ? `Share with ${timeline.dedicated_to}` : "Copy link to send"}
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="rounded-full border px-4 py-2 font-['DM_Sans'] text-xs font-medium transition hover:bg-black/5 sm:px-5 sm:py-2.5 sm:text-sm"
                style={{ borderColor: `${theme.accent}88` }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-full border px-4 py-2 font-['DM_Sans'] text-xs font-medium transition hover:bg-black/5 sm:px-5 sm:py-2.5 sm:text-sm"
                style={{ borderColor: `${theme.accent}88` }}
              >
                Copy link
              </button>
            </div>

            <Link
              href="/create"
              className="font-['DM_Sans'] text-[10px] uppercase tracking-[0.2em] underline-offset-4 hover:underline sm:text-xs"
              style={{ color: theme.accent }}
            >
              Make your own →
            </Link>

            <motion.span
              key={shareStatus ?? "idle"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: shareStatus ? 1 : 0, y: shareStatus ? 0 : 6 }}
              transition={{ duration: 0.25 }}
              className="h-4 font-['DM_Sans'] text-[11px]"
              style={{ color: theme.text, opacity: 0.75 }}
              aria-live="polite"
            >
              {shareStatus ?? ""}
            </motion.span>
          </motion.div>
        </div>
        {showFinale ? <FinaleEffects effect={timeline.ending_effect} accent={theme.accent} /> : null}
      </section>

      {/* Desktop dot navigation */}
      <div className="pointer-events-auto fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {Array.from({ length: totalSlides }).map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={`dot-${idx}`}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() =>
                slideRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-full transition-all"
              style={{
                width: isActive ? 10 : 8,
                height: isActive ? 10 : 8,
                backgroundColor: isActive ? theme.accent : "rgba(255,255,255,0.35)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
