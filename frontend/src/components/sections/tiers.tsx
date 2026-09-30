"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { TierBadge, type Tier } from "@/components/live/tier-badge";
import { Reveal } from "@/components/motion/reveal";
import { bookCallHref } from "@/lib/links";

type Plan = {
  tier: Tier;
  name: string;
  tagline: string;
  reviewer: string;
  summary: string;
  includes: string[];
  bestFor: string;
};

const plans: Plan[] = [
  {
    tier: "silver",
    name: "Silver",
    tagline: "Machine-grade coverage",
    reviewer: "Multiple AI agents + automated tooling",
    summary:
      "Several independent AI agents review your code and cross-check each other's findings, backed by a full automated test suite. Everything short of a human line-by-line read.",
    includes: [
      "Multi-agent AI review, cross-checked",
      "Static analysis for known bug classes",
      "Unit tests for the full flow and every function",
      "Fuzz tests on every public entry point",
      "Invariant tests on critical properties",
      "Ranked H / M / L findings report",
      "One re-check after your fixes",
    ],
    bestFor: "MVPs, testnet launches, pre-audit hygiene",
  },
  {
    tier: "gold",
    name: "Gold",
    tagline: "A human reads every line",
    reviewer: "Junior auditor + AI agents",
    summary:
      "Everything in Silver, plus a junior auditor who reads every state-changing function against its docs, follows every call it makes, and tags issues at the exact line.",
    includes: [
      "Everything in Silver",
      "Manual line-by-line review",
      "Doc-vs-code check on every function",
      "Call diagram for each entry point",
      "Access control and admin-power review",
      "Inline //@AUDIT-INFO tags in your repo",
      "Every fix re-checked before sign-off",
    ],
    bestFor: "Mainnet launches, token and NFT contracts",
  },
  {
    tier: "platinum",
    name: "Platinum",
    tagline: "Senior eyes, nothing skipped",
    reviewer: "Senior auditor leading the team",
    summary:
      "A senior auditor leads the engagement and takes every item on the checklist in depth, from the threat model to economic attacks, and leaves you a test suite you keep.",
    includes: [
      "Everything in Gold",
      "Senior auditor leads the review",
      "Full threat model and trust boundaries",
      "Business-logic and economic attacks",
      "Upgrade, pause and key-compromise scenarios",
      "Stateful invariant suite handed over",
      "Regression test for every finding",
    ],
    bestFor: "DeFi protocols, high TVL, upgradeable systems",
  },
];

const compare: [string, string, string, string][] = [
  ["Multi-agent AI review", "✓", "✓", "✓"],
  ["Static analysis", "✓", "✓", "✓"],
  ["Unit, fuzz and invariant tests", "✓", "✓", "✓"],
  ["Manual line-by-line review", "✕", "Junior auditor", "Senior auditor"],
  ["Threat model", "Entry points", "Standard", "Full, in depth"],
  ["Business-logic and economic attacks", "✕", "✕", "✓"],
  ["Fix verification", "One re-check", "Every fix", "Every fix + regression tests"],
];

function Check({ dark }: { dark?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-[3px] h-4 w-4 shrink-0 ${dark ? "text-flame-soft" : "text-flame"}`} aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({
  plan,
  index,
  dark,
  onHover,
}: {
  plan: Plan;
  index: number;
  dark: boolean;
  onHover: (tier: Tier | null) => void;
}) {
  return (
    <Reveal delay={index * 0.12} className="h-full">
      <motion.article
        onHoverStart={() => onHover(plan.tier)}
        onHoverEnd={() => onHover(null)}
        onFocus={() => onHover(plan.tier)}
        onBlur={() => onHover(null)}
        animate={{ y: dark ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`flex h-full flex-col rounded-2xl border p-7 transition-colors duration-300 sm:p-8 [&_*]:transition-colors [&_*]:duration-300 ${
          dark ? "border-coal bg-coal text-[#efeae3]" : "border-line bg-white/60"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`font-mono text-[11px] tracking-[0.2em] uppercase ${dark ? "text-flame-soft" : "text-flame"}`}>
              Tier {index + 1}
            </p>
            <h3 className="mt-2 font-serif text-4xl">{plan.name}</h3>
            <p className={`mt-1 font-serif text-lg italic ${dark ? "text-white/70" : "text-ink/70"}`}>{plan.tagline}</p>
          </div>
          <div className="-mt-2 -mr-3 shrink-0">
            <TierBadge tier={plan.tier} size={104} />
          </div>
        </div>

        <p className={`mt-6 text-[15px] leading-relaxed ${dark ? "text-white/75" : "text-ink/75"}`}>{plan.summary}</p>

        <p
          className={`mt-6 rounded-lg px-3 py-2 text-[13px] ${
            dark ? "bg-white/5 text-white/80" : "bg-paper-2 text-ink/80"
          }`}
        >
          <span className={dark ? "text-white/50" : "text-muted"}>Reviewed by · </span>
          {plan.reviewer}
        </p>

        <ul className="mt-6 flex-1 space-y-3">
          {plan.includes.map((item, i) => (
            <li key={item} className={`flex gap-3 text-[15px] ${i === 0 && index > 0 ? "font-medium" : ""}`}>
              <Check dark={dark} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className={`mt-8 border-t pt-5 ${dark ? "border-white/10" : "border-line"}`}>
          <p className={`text-[13px] ${dark ? "text-white/50" : "text-muted"}`}>Best for</p>
          <p className="mt-1 text-[15px]">{plan.bestFor}</p>
        </div>

        <a
          href={bookCallHref}
          className={`mt-6 rounded-md px-5 py-3 text-center text-[15px] transition-colors ${
            dark ? "bg-flame text-white hover:bg-[#f26416]" : "border border-ink/15 hover:border-ink/40"
          }`}
        >
          Talk to us about {plan.name}
        </a>
      </motion.article>
    </Reveal>
  );
}

export function Tiers() {
  // The highlighted card follows the pointer; Platinum is highlighted when nothing is hovered.
  const [hovered, setHovered] = useState<Tier | null>(null);

  return (
    <section id="tiers" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] text-flame uppercase">Audit tiers</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Pick the depth. <span className="italic text-flame">We cover the rest.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/70">
            Every tier runs the same automated base. What changes is who reads your code, and how
            deep they go.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.tier} plan={p} index={i} dark={p.tier === (hovered ?? "platinum")} onHover={setHovered} />
          ))}
        </div>

        <Reveal className="mt-14">
          <h3 className="font-serif text-2xl">Compare tiers side by side</h3>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white/60">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-4 font-normal text-muted">&nbsp;</th>
                  {plans.map((p) => (
                    <th key={p.tier} className="p-4 font-serif text-lg font-normal">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ...cells]) => (
                  <tr key={label} className="border-b border-line last:border-0">
                    <td className="p-4 text-ink/70">{label}</td>
                    {cells.map((c, i) => (
                      <td key={i} className={`p-4 ${c === "✓" ? "text-flame" : c === "✕" ? "text-ink/25" : ""}`}>
                        {c === "✕" ? <span aria-label="Not included">✕</span> : c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
