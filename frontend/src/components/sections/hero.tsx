"use client";

import { motion } from "motion/react";
import { SecurityCore } from "@/components/live/security-core";
import { TextRotate } from "@/components/motion/text-rotate";
import { bookCallHref } from "@/lib/links";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* faint dot grid, fading out from the console side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_75%_45%,#000_10%,transparent_65%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:px-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <motion.p {...fadeUp(0)} className="mb-8 flex items-center gap-2.5 text-sm text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-flame opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-flame" />
            </span>
            Now taking smart contract audits
          </motion.p>

          <h1 className="font-serif text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[4.4rem]">
            <motion.span {...fadeUp(0.1)} className="block text-flame">
              Your
            </motion.span>
            <motion.span {...fadeUp(0.2)} className="block text-ink">
              <TextRotate words={["smart contracts", "DeFi protocol", "token launch", "next upgrade"]} />
            </motion.span>
            <motion.span {...fadeUp(0.3)} className="mt-3 block italic text-flame">
              audited real deep.
            </motion.span>
          </h1>

          <motion.p {...fadeUp(0.45)} className="mt-8 max-w-md text-[17px] leading-relaxed text-ink/75">
            AI agents, fuzzers and human auditors go through your contracts the way an attacker
            would, then hand you a clear, ranked list of what to fix before mainnet.
          </motion.p>

          <motion.div {...fadeUp(0.55)} className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href={bookCallHref}
              className="rounded-md bg-ink-2 px-6 py-3.5 text-[15px] text-white transition-colors hover:bg-ink"
            >
              Book a call
            </a>
            <a href="#tiers" className="group text-[15px] text-ink">
              Compare audit tiers{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </motion.div>
        </div>

        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <SecurityCore />
        </motion.div>
      </div>
    </section>
  );
}
