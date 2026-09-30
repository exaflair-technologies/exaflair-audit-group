"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { severities, severityStyle, statusStyles } from "@/components/portfolio/severity-styles";
import type { Issue, Severity } from "@/data/audits";

/** Every finding, filterable by severity; each row opens to show the issue before and the fix after. */
export function FindingsList({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [open, setOpen] = useState<string | null>(issues[0]?.id ?? null);
  const present = severities.filter((s) => issues.some((i) => i.severity === s.key));
  const shown = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filter findings by severity" className="flex flex-wrap gap-2">
        {[{ key: "all" as const, label: "All" }, ...present].map((f) => {
          const active = filter === f.key;
          const count = f.key === "all" ? issues.length : issues.filter((i) => i.severity === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${active ? "text-white" : "text-ink/70 hover:text-ink"}`}
            >
              {active && (
                <motion.span
                  layoutId="finding-filter"
                  className="absolute inset-0 rounded-full bg-coal"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label} <span className={active ? "text-white/50" : "text-ink/35"}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/60">
        {shown.map((issue) => {
          const sev = severityStyle(issue.severity);
          const status = statusStyles[issue.status];
          const isOpen = open === issue.id;
          return (
            <li key={issue.id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : issue.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-paper-2/60 sm:px-6"
              >
                <span className={`w-14 shrink-0 rounded-md py-1 text-center font-mono text-[12px] ${sev.soft} ${sev.text}`}>
                  {issue.id}
                </span>
                <span className="min-w-0 flex-1 text-[15px]">{issue.title}</span>
                <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[12px] sm:inline ${status.cls}`}>{status.label}</span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="shrink-0 text-lg leading-none text-ink/40">
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pl-[5.5rem]">
                      <div className="rounded-xl border border-sev-c/15 bg-sev-c/[0.04] p-4">
                        <p className="font-mono text-[11px] tracking-[0.18em] text-sev-c uppercase">Before</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{issue.before}</p>
                      </div>
                      <div className="rounded-xl border border-ok/15 bg-ok/[0.04] p-4">
                        <p className="font-mono text-[11px] tracking-[0.18em] text-ok uppercase">After</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{issue.after}</p>
                      </div>
                      <p className={`rounded-full px-2.5 py-1 text-[12px] sm:hidden ${status.cls} w-fit`}>{status.label}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
