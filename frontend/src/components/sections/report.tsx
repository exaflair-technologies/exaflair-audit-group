"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

const severities = [
  { key: "H", cls: "bg-sev-h text-white", label: "High", text: "Wrong in a realistic path. Touches money, security or data integrity." },
  { key: "M", cls: "bg-sev-m text-ink", label: "Medium", text: "A real bug with low likelihood, or a smell that will bite later." },
  { key: "L", cls: "bg-sev-l text-white", label: "Low", text: "Naming, cleanup, style. No functional risk." },
];

const report = [
  {
    file: "contracts/Vault.sol",
    items: [
      { sev: "H", line: 4, text: "reentrancy: external call before balance update" },
      { sev: "M", line: 15, text: "divides by zero while totalAssets == 0" },
    ],
  },
  {
    file: "contracts/FeeController.sol",
    items: [
      { sev: "H", line: 22, text: "setFee has no access control" },
      { sev: "L", line: 9, text: "revert string: use a custom error" },
    ],
  },
];

export function Report() {
  const all = report.flatMap((f) => f.items);
  const count = (s: string) => all.filter((i) => i.sev === s).length;

  return (
    <section id="report" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:px-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.2em] text-flame uppercase">What you get back</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Findings at the exact line. <span className="italic text-flame">No noise.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/70">
            One tag per issue, right where it lives in your code, plus an{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[14px]">auditfile.md</code> grouped by
            file with a running total. We don&apos;t flag style opinions or verbose comments.
          </p>

          <ul className="mt-10 space-y-5">
            {severities.map((s) => (
              <li key={s.key} className="flex gap-4">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold ${s.cls}`}>
                  {s.key}
                </span>
                <div>
                  <p className="text-[15px] font-medium">{s.label}</p>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-ink/65">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-2xl border border-line bg-white/70">
            <div className="border-b border-line px-5 py-3 font-mono text-[11px] text-ink/60">auditfile.md</div>
            <div className="space-y-6 p-5 font-mono text-[12.5px] sm:p-6">
              {report.map((f, fi) => (
                <div key={f.file}>
                  <p className="text-ink">## {f.file}</p>
                  <ul className="mt-2 space-y-2">
                    {f.items.map((it, i) => (
                      <motion.li
                        key={it.line}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + fi * 0.4 + i * 0.15 }}
                        className="flex gap-2 text-ink/70"
                      >
                        <span>-</span>
                        <span>
                          <span
                            className={`mr-1.5 rounded px-1 text-[11px] font-semibold ${
                              severities.find((s) => s.key === it.sev)!.cls
                            }`}
                          >
                            {it.sev}
                          </span>
                          <span className="text-flame underline decoration-flame/30 underline-offset-2">
                            {f.file.split("/")[1]}:{it.line}
                          </span>{" "}
                          {it.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-paper-2/60 px-5 py-4 font-mono text-[12px] sm:px-6">
              <span className="text-ink">
                Total <CountUp to={all.length} />
              </span>
              {severities.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-ink/60">
                  <span className={`h-2 w-2 rounded-full ${s.cls.split(" ")[0]}`} />
                  {s.key} <CountUp to={count(s.key)} />
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
