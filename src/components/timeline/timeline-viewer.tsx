"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { FinaleEffects } from "@/components/timeline/finale-effects";
import { THEME_MAP } from "@/lib/theme";
import type { TimelinePayload } from "@/types/timeline";

type TimelineViewerProps = {
  payload: TimelinePayload;
};

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLElement).dataset.slideIndex ?? "0");
          setCurrentSlide(idx);

          if (idx < cards.length) {
            setEagerCardIndices((prev) => {
              const next = idx;
              if (prev.includes(next)) return prev;
              return [...prev, next];
            });
          }
        });
      },
      { threshold: 0.9 },
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-20 z-10 px-6 sm:px-10">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src="/forevergram-logo.png"
            alt="Forevergram logo"
            className="mb-4 h-12 w-12 rounded-lg border border-white/30 bg-white/80 p-1 object-cover"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-3 font-['DM_Sans'] text-xs uppercase tracking-[0.22em] text-white/80"
          >
            Forevergram
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 1, ease: "easeOut" }}
            className="max-w-3xl font-['Playfair_Display'] text-[2.4rem] leading-tight text-white sm:text-[52px]"
          >
            {timeline.dedicated_to}
          </motion.h1>
          {timeline.creator_name ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
              className="mt-3 font-['DM_Sans'] text-sm text-white/80"
            >
              Made with love by {timeline.creator_name}
            </motion.p>
          ) : null}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/90"
        >
          <span className="animate-bounce text-2xl">↓</span>
          <span className="font-['DM_Sans'] text-xs uppercase tracking-[0.18em]">Swipe up</span>
        </motion.div>
      </section>

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
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/30" />

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 z-10 min-h-[40%] bg-gradient-to-t from-black/[0.85] via-black/40 to-transparent px-5 pb-10 pt-6 sm:px-8"
            >
              <p className="font-['Playfair_Display'] text-[70px] leading-none sm:text-[80px]" style={{ color: theme.accent }}>
                {card.year}
              </p>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{card.caption}</p>
              {card.emotion_tag ? (
                <span
                  className="mt-4 inline-flex rounded-full border px-3 py-1 font-['DM_Sans'] text-xs uppercase tracking-[0.12em]"
                  style={{ borderColor: `${theme.accent}88`, color: theme.accent }}
                >
                  {card.emotion_tag}
                </span>
              ) : null}
            </motion.div>

            <div className="absolute bottom-32 right-4 z-20 flex flex-col items-center gap-6">
              <span className="font-['DM_Sans'] text-xs tracking-[0.14em] text-white/90">
                {index + 1}/{cards.length}
              </span>
              <span style={{ color: theme.accent }} className="text-xl">
                ♥
              </span>
            </div>
          </section>
        );
      })}

      <section
        ref={(el) => {
          slideRefs.current[totalSlides - 1] = el;
        }}
        data-slide-index={totalSlides - 1}
        className="relative flex h-[100dvh] shrink-0 snap-start items-center justify-center px-6 py-20 text-center"
      >
        <div className="mx-auto max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-5 font-['DM_Sans'] text-xs uppercase tracking-[0.18em]"
            style={{ color: `${theme.accent}` }}
          >
            Final message
          </motion.p>

          <motion.h2
            onViewportEnter={() => setShowFinale(true)}
            viewport={{ once: true, amount: 0.6 }}
            className="font-['Playfair_Display'] text-3xl leading-relaxed sm:text-5xl"
          >
            {timeline.final_message.split(" ").map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: index * 0.04, ease: "easeOut" }}
                className="inline-block mr-2"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-14 flex flex-col items-center gap-4"
          >
            <p
              className="font-['DM_Sans'] text-xs uppercase tracking-[0.18em]"
              style={{ color: `${theme.accent}` }}
            >
              Send this to {timeline.dedicated_to}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="rounded-full px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:scale-[1.03]"
                style={{ backgroundColor: theme.accent }}
              >
                {canNativeShare ? "Share with Mum" : "Copy link to send"}
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="rounded-full border px-5 py-2.5 font-['DM_Sans'] text-sm font-medium transition hover:bg-black/5"
                style={{ borderColor: `${theme.accent}88` }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-full border px-5 py-2.5 font-['DM_Sans'] text-sm font-medium transition hover:bg-black/5"
                style={{ borderColor: `${theme.accent}88` }}
              >
                Copy link
              </button>
            </div>

            <Link
              href="/create"
              className="mt-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline"
              style={{ color: `${theme.accent}` }}
            >
              Make your own →
            </Link>

            <motion.span
              key={shareStatus ?? "idle"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: shareStatus ? 1 : 0, y: shareStatus ? 0 : 6 }}
              transition={{ duration: 0.25 }}
              className="h-4 font-['DM_Sans'] text-xs"
              style={{ color: theme.text, opacity: 0.75 }}
              aria-live="polite"
            >
              {shareStatus ?? ""}
            </motion.span>
          </motion.div>
        </div>
        {showFinale ? <FinaleEffects effect={timeline.ending_effect} accent={theme.accent} /> : null}
      </section>

      <div className="pointer-events-auto fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {Array.from({ length: totalSlides }).map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={`dot-${idx}`}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => slideRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="rounded-full transition-all"
              style={{
                width: isActive ? 10 : 8,
                height: isActive ? 10 : 8,
                backgroundColor: isActive ? theme.accent : "rgba(255,255,255,0.3)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
