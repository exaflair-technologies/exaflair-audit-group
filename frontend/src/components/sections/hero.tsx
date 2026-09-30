"use client";

import { motion, useReducedMotion } from "motion/react";
import { HeroCube } from "@/components/live/hero-cube";
import { bookCallHref } from "@/lib/links";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// EVM opcodes drifting up the background. Fixed positions so server and client render the same markup.
const opcodes = [
  { text: "DELEGATECALL", x: "6%", y: "72%", delay: 0 },
  { text: "SSTORE", x: "14%", y: "38%", delay: 2.4 },
  { text: "0x5f5e1000", x: "22%", y: "84%", delay: 4.1 },
  { text: "CALLVALUE", x: "80%", y: "30%", delay: 1.2 },
  { text: "REVERT", x: "88%", y: "66%", delay: 3.3 },
  { text: "0xa9059cbb", x: "74%", y: "88%", delay: 5.2 },
  { text: "SLOAD", x: "92%", y: "46%", delay: 0.7 },
  { text: "EXTCODESIZE", x: "3%", y: "52%", delay: 5.8 },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-white sm:h-[100svh] sm:min-h-[600px]">
      {/* backdrop: top vignette, central glow, perspective grid floor */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,117,43,0.14),transparent_70%)]" />
        <div className="absolute top-[58%] left-1/2 h-[60vw] max-h-[720px] w-[60vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/15 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden [mask-image:linear-gradient(to_top,#000_10%,transparent_95%)] [perspective:420px]">
          <div className="hero-floor absolute inset-x-[-60%] bottom-0 h-[180%] origin-bottom [transform:rotateX(74deg)]" />
        </div>
        {!reduce &&
          opcodes.map((o) => (
            <motion.span
              key={o.text}
              className="absolute hidden font-mono text-[11px] tracking-widest text-flame/40 md:block"
              style={{ left: o.x, top: o.y }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -140 }}
              transition={{ duration: 9, delay: o.delay, repeat: Infinity, ease: "linear" }}
            >
              {o.text}
            </motion.span>
          ))}
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center px-4 pt-24 pb-8 text-center sm:px-8 sm:pt-28 sm:pb-10 lg:px-12">
        <motion.p
          {...fadeUp(0)}
          className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-3 text-[13px] text-white/70 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-flame opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-flame" />
          </span>
          Now taking smart contract audits
        </motion.p>

        <h1 className="mt-5 font-serif text-[2.35rem] leading-[1.02] sm:text-[min(4.5rem,8vh)]">
          <motion.span {...fadeUp(0.1)} className="block">
            Break your protocol
          </motion.span>
          <motion.span
            {...fadeUp(0.2)}
            className="block bg-gradient-to-r from-flame-soft via-flame to-[#ff4d1a] bg-clip-text pb-2 text-transparent italic"
          >
            before attackers do.
          </motion.span>
        </h1>

        <motion.div
          className="relative h-[300px] w-full sm:h-auto sm:min-h-0 sm:flex-1"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroCube />
        </motion.div>

        <motion.p {...fadeUp(0.5)} className="max-w-2xl text-[16px] leading-relaxed text-white/65">
          AI agents, fuzzers and senior auditors attack your contracts like a real adversary, then hand you
          a ranked list of what to fix before mainnet.
        </motion.p>

        <motion.div {...fadeUp(0.6)} className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href={bookCallHref}
            className="rounded-md bg-flame px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_40px_-8px_rgba(255,117,43,0.8)] transition hover:-translate-y-0.5 hover:bg-[#ff8a4c]"
          >
            Book an audit call
          </a>
          <a
            href="#tiers"
            className="group rounded-md border border-white/15 px-6 py-3.5 text-[15px] text-white/85 transition-colors hover:border-white/40 hover:text-white"
          >
            Compare audit tiers{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
