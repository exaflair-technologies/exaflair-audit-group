"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { AgentReview, CallDiagram, FuzzStream, InvariantMonitor, TestRunner } from "@/components/live/process-visuals";
import { Reveal } from "@/components/motion/reveal";

type Method = {
  n: string;
  title: string;
  lead: string;
  body: string;
  steps?: { title: string; text: string }[];
  visual: ReactNode;
};

const methods: Method[] = [
  {
    n: "01",
    title: "AI agent review",
    lead: "Multiple AI agents read your code at once, hunting for security holes and wasted gas.",
    body: "Each agent has one specialty (security, gas optimisation, logic or access control), and they cross-check each other. Findings most agents agree on are confirmed; the rest go to a human.",
    visual: <AgentReview />,
  },
  {
    n: "02",
    title: "Manual review",
    lead: "Automated tools miss business-logic flaws. A human reads every state-changing function.",
    body: "Done function by function, in the same five steps every time.",
    steps: [
      { title: "Read doc and function together", text: "Does the code do what the comment claims? A wrong doc is a finding on its own." },
      { title: "Match execution to docs", text: "Walk the real control flow. Anything missing, or anything extra, gets flagged." },
      { title: "Follow the calls out", text: "Open every function it calls. Most real bugs live here: A assumes B checked it, B doesn't." },
      { title: "Check every condition", text: "The false path, the missing value, the edge case. Does it fail loudly or silently?" },
      { title: "Draw the call diagram first", text: "Half of what looks like a bug disappears once the whole chain is in view." },
    ],
    visual: <CallDiagram />,
  },
  {
    n: "03",
    title: "Unit tests",
    lead: "The full flow end to end, and every function on its own.",
    body: "A function that passes in isolation but fails as part of the flow, or the other way round, is a finding in itself.",
    visual: <TestRunner />,
  },
  {
    n: "04",
    title: "Fuzz tests",
    lead: "Every public function and endpoint, hit with randomized inputs.",
    body: "Boundary values, malformed data, unexpected types and sizes: the inputs a reviewer wouldn't think to try. Failures are shrunk to the smallest case that breaks.",
    visual: <FuzzStream />,
  },
  {
    n: "05",
    title: "Invariant tests",
    lead: "Properties that must always hold, checked after every single call.",
    body: "A stateful suite calls your functions in random order and asserts each invariant after every step. Any break gets a permanent regression test next to the fix.",
    visual: <InvariantMonitor />,
  },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="process" className="scroll-mt-24 border-y border-line bg-white/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <Reveal className="max-w-2xl">
          <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">How we audit</p>
          <h2 className="mt-4 font-semibold tracking-tight text-4xl leading-tight sm:text-5xl">
            Five methods, <span className="text-flame">in this order.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/70">
            Each method catches bugs the others miss, so together they cover far more than any one
            alone. We tag every issue in place during the audit, which keeps findings clean and easy to
            verify, then you fix them in a separate pass.
          </p>
        </Reveal>

        <div ref={ref} className="relative mt-20">
          {/* scroll progress rail */}
          <div aria-hidden className="absolute top-0 bottom-0 left-[15px] hidden w-px bg-line lg:block">
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-flame" />
          </div>

          <div className="space-y-24 sm:space-y-32">
            {methods.map((m) => (
              <div key={m.n} className="relative grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pl-16">
                <span
                  aria-hidden
                  className="absolute top-1 left-0 hidden h-[31px] w-[31px] items-center justify-center rounded-full border border-flame bg-paper font-medium text-[11px] text-flame lg:flex"
                >
                  {m.n}
                </span>

                <Reveal className="min-w-0">
                  <p className="font-medium text-sm text-flame lg:hidden">{m.n}</p>
                  <h3 className="mt-1 font-semibold tracking-tight text-3xl sm:text-4xl lg:mt-0">{m.title}</h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-ink">{m.lead}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/65">{m.body}</p>

                  {m.steps && (
                    <ol className="mt-8 space-y-5">
                      {m.steps.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                          <span className="mt-0.5 font-medium text-xs text-ink/40">{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <p className="text-[15px] font-medium">{s.title}</p>
                            <p className="mt-1 text-[14px] leading-relaxed text-ink/60">{s.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Reveal>

                <Reveal delay={0.15} className="min-w-0 lg:sticky lg:top-28">
                  {m.visual}
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
