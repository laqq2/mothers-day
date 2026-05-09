"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="min-h-screen px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <div>
          <motion.img
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            src="/forevergram-logo.png"
            alt="Forevergram logo"
            className="mb-5 h-14 w-14 rounded-xl border border-[#1C1008]/10 bg-white/60 p-1 shadow-sm"
          />
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-['DM_Sans'] text-xs uppercase tracking-[0.22em] text-[#C4714A]"
          >
            Mother&apos;s Day · Made in minutes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-4 font-['Playfair_Display'] text-5xl leading-[1.1] text-[#1C1008] sm:text-6xl lg:text-7xl"
          >
            Give her a tribute worth saving forever.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-5 max-w-md font-['Lora'] text-lg text-[#1C1008]/70"
          >
            Turn your favourite memories into a cinematic scroll she&apos;ll watch again and again. No design skills.
            Just your photos and a few words.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/create"
              className="rounded-full bg-[#C4714A] px-7 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              Create yours — it&apos;s free
            </Link>
            <Link
              href="/t/demo-timeline"
              className="rounded-full border border-[#C4714A]/40 px-7 py-3 font-['DM_Sans'] text-sm text-[#C4714A] transition hover:bg-[#C4714A]/5"
            >
              See a demo →
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-4 font-['DM_Sans'] text-xs text-[#1C1008]/40"
          >
            No account needed · Free to share · Takes 5 minutes
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="relative"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#C4714A] opacity-30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-[#E8D5C0] opacity-30 blur-3xl" />

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto h-[500px] w-[280px] overflow-hidden rounded-[2.5rem] border-[6px] border-[#1C1008]/10 bg-[#1C1008] shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <img
              src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80"
              alt="Timeline preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-['Playfair_Display'] text-6xl text-[#C4714A]">2003</p>
              <p className="mt-2 max-w-[210px] font-['Lora'] text-sm text-white/80">
                Saturday mornings meant pancakes, cartoons, and your laugh filling the kitchen.
              </p>
              <span className="mt-3 inline-flex rounded-full border border-[#C4714A]/70 px-3 py-1 font-['DM_Sans'] text-[10px] uppercase tracking-[0.12em] text-[#C4714A]">
                nostalgic
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
