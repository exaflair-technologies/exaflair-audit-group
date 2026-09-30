"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BorderTrail } from "@/components/motion/border-trail";

type Severity = "H" | "M" | "L";

const code = [
  "function withdraw(uint256 amount) external {",
  "  uint256 bal = balances[msg.sender];",
  '  require(bal >= amount, "insufficient");',
  '  (bool ok, ) = msg.sender.call{value: amount}("");',
  "  require(ok);",
  "  balances[msg.sender] = bal - amount;",
  "}",
  "",
  "function setFee(uint256 fee) external {",
  "  feeBps = fee;",
  "}",
  "",
  "function toShares(uint256 assets)",
  "  public view returns (uint256) {",
  "  return assets * totalShares / totalAssets;",
  "}",
];

const findings: Record<number, { sev: Severity; text: string }> = {
  2: { sev: "L", text: "revert string: a custom error is cheaper" },
  3: { sev: "H", text: "reentrancy: external call before balance update" },
  8: { sev: "H", text: "no access control: anyone can set the fee" },
  9: { sev: "M", text: "fee is unbounded, can exceed 10_000 bps" },
  14: { sev: "M", text: "divides by zero while totalAssets == 0" },
};

const phases = ["static analysis", "agent review", "manual pass", "fuzzing"];

const sevStyle: Record<Severity, string> = {
  H: "bg-sev-h text-white",
  M: "bg-sev-m text-ink",
  L: "bg-sev-l text-white",
};

const STEP_MS = 520;
const HOLD_STEPS = 7;

export function AuditConsole() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % (code.length + HOLD_STEPS)), STEP_MS);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const cursor = reduce ? code.length : step;
  const scanning = cursor < code.length;
  const found = Object.entries(findings).filter(([line]) => Number(line) < cursor);
  const count = (sev: Severity) => found.filter(([, f]) => f.sev === sev).length;
  const phase = phases[Math.min(phases.length - 1, Math.floor((cursor / code.length) * phases.length))];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-ink text-[#e9e4dc] shadow-[0_30px_80px_-30px_rgba(29,20,16,0.55)]"
    >
      <BorderTrail size={120} duration={8} />

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <span className="font-mono text-xs text-white/70">contracts/Vault.sol</span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-white/60">
          <span className="relative flex h-2 w-2">
            {scanning && <span className="absolute inset-0 animate-ping rounded-full bg-flame opacity-70" />}
            <span className={`relative h-2 w-2 rounded-full ${scanning ? "bg-flame" : "bg-ok"}`} />
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={scanning ? phase : "done"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {scanning ? phase : "report ready"}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <div className="overflow-x-auto px-2 py-3 font-mono text-[11px] leading-[1.75] sm:text-[12.5px]">
        {code.map((line, i) => {
          const f = findings[i];
          const active = scanning && i === cursor;
          const shown = f && i < cursor;
          return (
            <div key={i}>
              <div
                className={`relative flex rounded px-2 transition-colors duration-200 ${
                  active ? "bg-flame/15" : shown && f.sev === "H" ? "bg-sev-h/10" : ""
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="scan-bar"
                    className="absolute top-0 left-0 h-full w-0.5 rounded bg-flame"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="w-7 shrink-0 text-right text-white/25 select-none">{i + 1}</span>
                <span className="pl-4 whitespace-pre">{line || " "}</span>
              </div>
              <AnimatePresence initial={false}>
                {shown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 py-1 pl-[3.25rem] pr-2 text-flame-soft">
                      <span className="shrink-0 whitespace-nowrap text-white/35">{"//@AUDIT-INFO:"}</span>
                      <span className={`shrink-0 rounded px-1 text-[10px] leading-[1.6] font-semibold ${sevStyle[f.sev]}`}>
                        {f.sev}
                      </span>
                      <span className="whitespace-normal">{f.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 border-t border-white/10 px-4 py-3 font-mono text-[11px] sm:px-5">
        {(["H", "M", "L"] as const).map((sev) => (
          <span key={sev} className="flex items-center gap-1.5 text-white/60">
            <span className={`h-2 w-2 rounded-full ${sevStyle[sev].split(" ")[0]}`} />
            {sev}
            <motion.span key={count(sev)} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-white">
              {count(sev)}
            </motion.span>
          </span>
        ))}
        <div className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-white/10 sm:w-32">
          <motion.div
            className="h-full rounded-full bg-flame"
            animate={{ width: `${(Math.min(cursor, code.length) / code.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
