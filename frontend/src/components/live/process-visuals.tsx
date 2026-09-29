"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Runs `tick` on an interval, only while the element is on screen and motion is allowed. */
function useLiveTick(tick: () => void, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduce = useReducedMotion();
  const tickRef = useRef(tick);

  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => tickRef.current(), ms);
    return () => clearInterval(id);
  }, [inView, reduce, ms]);

  return { ref, reduce: !!reduce };
}

function Panel({ title, status, children }: { title: string; status: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white/70">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px]">
        <span className="text-ink/60">{title}</span>
        <span className="text-ink/60">{status}</span>
      </div>
      {children}
    </div>
  );
}

/* ---------- 0. AI agents: parallel review with voting ---------- */

const agents = [
  { name: "security", tasks: ["tracing external calls", "checking reentrancy guards", "mapping trust boundaries"] },
  { name: "gas", tasks: ["profiling storage reads", "looking for packable slots", "caching loop lengths"] },
  { name: "logic", tasks: ["comparing docs to code", "walking branch paths", "checking rounding direction"] },
  { name: "access", tasks: ["listing privileged functions", "checking onlyOwner coverage", "simulating key loss"] },
];

const agentFindings = [
  { kind: "security", text: "reentrancy in withdraw()", votes: 4 },
  { kind: "gas", text: "cache balances[msg.sender] — ~2.1k gas", votes: 3 },
  { kind: "security", text: "setFee() has no access control", votes: 4 },
  { kind: "gas", text: "pack feeBps + paused into one slot", votes: 2 },
];

const AGENT_STEPS = 13;

export function AgentReview() {
  const [step, setStep] = useState(0);
  const { ref, reduce } = useLiveTick(() => setStep((s) => (s + 1) % AGENT_STEPS), 900);
  const s = reduce ? AGENT_STEPS - 1 : step;
  const shown = agentFindings.filter((_, i) => s >= 2 + i * 2);
  const done = shown.length === agentFindings.length;

  return (
    <div ref={ref}>
      <Panel
        title="agents · Vault.sol"
        status={done ? "cross-check complete" : `${agents.length} agents running`}
      >
        <ul className="grid grid-cols-2 gap-2 p-4 pb-3">
          {agents.map((a, i) => {
            const busy = !done && s % agents.length === i;
            return (
              <li key={a.name} className="rounded-lg border border-line px-3 py-2.5">
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="relative flex h-2 w-2">
                    {busy && <span className="absolute inset-0 animate-ping rounded-full bg-flame opacity-70" />}
                    <span className={`relative h-2 w-2 rounded-full ${done ? "bg-ok" : "bg-flame"}`} />
                  </span>
                  <span className="text-ink">{a.name}-agent</span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={done ? "done" : (s + i) % a.tasks.length}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 truncate font-mono text-[11px] text-ink/50"
                  >
                    {done ? "done" : a.tasks[(s + i) % a.tasks.length]}
                  </motion.p>
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <ul className="h-[172px] space-y-1.5 border-t border-line px-4 py-3 font-mono text-[12px]">
          <AnimatePresence initial={false}>
            {shown.map((f) => {
              const confirmed = f.votes >= 3;
              return (
                <motion.li
                  key={f.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2.5 rounded px-2 py-1.5"
                >
                  <span
                    className={`w-[62px] shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] ${
                      f.kind === "security" ? "bg-sev-h/10 text-sev-h" : "bg-flame-wash text-flame"
                    }`}
                  >
                    {f.kind}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink/80">{f.text}</span>
                  <span className="flex shrink-0 gap-0.5" title={`${f.votes} of ${agents.length} agents agree`}>
                    {agents.map((_, v) => (
                      <span key={v} className={`h-1.5 w-1.5 rounded-full ${v < f.votes ? "bg-ink/70" : "bg-ink/15"}`} />
                    ))}
                  </span>
                  <span className={`hidden w-[88px] shrink-0 text-right text-[11px] sm:inline ${confirmed ? "text-ok" : "text-sev-m"}`}>
                    {confirmed ? "confirmed" : "to human"}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </Panel>
    </div>
  );
}

/* ---------- 1. Manual review: call diagram ---------- */

const nodes = [
  { id: "a", label: "withdraw(amount)", x: 100, y: 14 },
  { id: "b", label: "_checkLimit()", x: 14, y: 96 },
  { id: "c", label: "vault.pull()", x: 190, y: 96 },
  { id: "d", label: "token.transfer()", x: 190, y: 176 },
];
const W = 134;
const H = 32;
const edges = [
  { d: "M150 46 C150 70 81 70 81 96", n: "1" },
  { d: "M184 46 C184 70 257 70 257 96", n: "2" },
  { d: "M257 128 L257 176", n: "3" },
];

export function CallDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const drawn = inView || reduce;

  return (
    <div ref={ref}>
      <Panel title="call diagram · withdraw()" status="before writing anything down">
        <svg viewBox="0 0 340 250" className="block w-full" role="img" aria-label="Call diagram: withdraw calls _checkLimit, then vault.pull, which calls token.transfer. vault.pull assumes _checkLimit validated the amount, but it did not.">
          {edges.map((e, i) => (
            <g key={i}>
              <motion.path
                d={e.d}
                fill="none"
                stroke="var(--ink)"
                strokeOpacity="0.35"
                strokeWidth="1.25"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: drawn ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.35 }}
              />
              {!reduce && (
                <circle r="3" fill="var(--flame)" opacity="0">
                  <animateMotion dur="1.2s" begin={`${1.6 + i * 1.2}s;edge-dot-${i}.end+2.4s`} id={`edge-dot-${i}`} path={e.d} />
                  {/* only visible while travelling, so it never parks at the SVG origin */}
                  <animate attributeName="opacity" values="1;1" dur="1.2s" begin={`edge-dot-${i}.begin`} />
                </circle>
              )}
            </g>
          ))}
          {edges.map((e, i) => {
            const pts = [
              [108, 70],
              [228, 70],
              [270, 155],
            ][i];
            return (
              <text key={i} x={pts[0]} y={pts[1]} fontSize="10" fontFamily="var(--font-jetbrains)" fill="var(--flame)">
                {e.n}
              </text>
            );
          })}
          {nodes.map((n, i) => {
            const flagged = n.id === "c";
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={drawn ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.25 }}
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={W}
                  height={H}
                  rx="8"
                  fill={flagged ? "var(--flame-wash)" : "#fff"}
                  stroke={flagged ? "var(--sev-h)" : "var(--line)"}
                  strokeWidth={flagged ? 1.5 : 1}
                  strokeDasharray={flagged ? "4 3" : undefined}
                />
                <text
                  x={n.x + W / 2}
                  y={n.y + 20}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontFamily="var(--font-jetbrains)"
                  fill="var(--ink)"
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}
          <motion.g
            initial={{ opacity: 0 }}
            animate={drawn ? { opacity: 1 } : {}}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <path d="M190 116 C172 124 160 134 150 146" fill="none" stroke="var(--sev-h)" strokeWidth="1" strokeDasharray="2 3" />
            {["pull() assumes", "_checkLimit() checked", "the amount. It doesn't."].map((t, i) => (
              <text key={t} x="14" y={156 + i * 16} fontSize="11" fontFamily="var(--font-jetbrains)" fill="var(--sev-h)">
                {t}
              </text>
            ))}
            <text x="14" y="236" fontSize="10" fontFamily="var(--font-jetbrains)" fill="var(--ink)" opacity="0.5">
              {"//@AUDIT-INFO: H: unchecked amount reaches pull()"}
            </text>
          </motion.g>
        </svg>
      </Panel>
    </div>
  );
}

/* ---------- 2. Unit tests: runner ---------- */

const tests = [
  { name: "withdraw · reverts on zero amount", pass: true },
  { name: "withdraw · updates balance first", pass: true },
  { name: "deposit → withdraw · full flow", pass: true },
  { name: "setFee · only owner can call", pass: true },
  { name: "toShares · empty vault", pass: false },
  { name: "deposit → setFee → withdraw · flow", pass: true },
];

export function TestRunner() {
  const [done, setDone] = useState(0);
  const { ref, reduce } = useLiveTick(() => setDone((d) => (d + 1) % (tests.length + 5)), 650);
  const shown = reduce ? tests.length : Math.min(done, tests.length);
  const finished = shown === tests.length;
  const failed = tests.slice(0, shown).filter((t) => !t.pass).length;

  return (
    <div ref={ref}>
      <Panel
        title="forge test"
        status={finished ? `${tests.length - failed} passed · ${failed} failed` : `running ${shown + 1}/${tests.length}`}
      >
        <ul className="space-y-0.5 p-4 font-mono text-[12px] sm:text-[12.5px]">
          {tests.map((t, i) => {
            const state = i < shown ? (t.pass ? "pass" : "fail") : i === shown ? "run" : "idle";
            return (
              <li key={t.name} className="flex items-center gap-3 rounded px-2 py-1.5">
                <span className="flex w-4 justify-center">
                  {state === "pass" && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-ok">✓</motion.span>}
                  {state === "fail" && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sev-h">✗</motion.span>}
                  {state === "run" && (
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full border border-flame border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    />
                  )}
                  {state === "idle" && <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />}
                </span>
                <span className={state === "idle" ? "text-ink/35" : state === "fail" ? "text-sev-h" : "text-ink/80"}>
                  {t.name}
                </span>
              </li>
            );
          })}
        </ul>
        <AnimatePresence>
          {finished && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-line bg-flame-wash px-6 font-mono text-[12px] text-ink/80"
            >
              <span className="block py-3">
                Passes alone, fails in the flow? That&apos;s its own finding → logged as{" "}
                <span className="rounded bg-sev-m px-1 text-ink">M</span>
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </Panel>
    </div>
  );
}

/* ---------- 3. Fuzz tests: input stream ---------- */

const amounts = ["0", "1", "type(uint256).max", "2**255", "1e18", "7", "2**128 - 1", "999999999999"];
const recipients = ["address(0)", "msg.sender", "0xdEaD…bEEF", "address(this)", "0x0000…0001"];
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

type FuzzRow = { id: number; amount: string; to: string; bad?: boolean };

const seedRows: FuzzRow[] = [
  { id: 3, amount: "1e18", to: "msg.sender" },
  { id: 2, amount: "7", to: "0xdEaD…bEEF" },
  { id: 1, amount: "0", to: "address(this)" },
];

export function FuzzStream() {
  const [rows, setRows] = useState<FuzzRow[]>(seedRows);
  const [runs, setRuns] = useState(12_480);
  const { ref } = useLiveTick(() => {
    setRuns((r) => r + 37 + Math.floor(Math.random() * 60));
    setRows((prev) => {
      const id = prev[0].id + 1;
      const bad = id % 14 === 0;
      const next: FuzzRow = bad
        ? { id, amount: "1", to: "address(0)", bad: true }
        : { id, amount: pick(amounts), to: pick(recipients) };
      return [next, ...prev].slice(0, 5);
    });
  }, 420);

  return (
    <div ref={ref}>
      <Panel title="fuzz · deposit(assets, to)" status={<span className="tabular-nums">runs {runs.toLocaleString("en-US")}</span>}>
        <ul className="h-[212px] overflow-hidden p-4 font-mono text-[12px] sm:text-[12.5px]">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`mb-1.5 flex flex-wrap gap-x-2 rounded px-2 py-1.5 ${r.bad ? "bg-sev-h/10 text-sev-h" : "text-ink/70"}`}
              >
                <span className="text-ink/30">#{r.id}</span>
                <span>assets = {r.amount},</span>
                <span>to = {r.to}</span>
                {r.bad && <span className="w-full pl-8 text-[11px]">↳ counterexample shrunk: mints shares to address(0)</span>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Panel>
    </div>
  );
}

/* ---------- 4. Invariant tests: live monitor ---------- */

const calls = ["deposit", "withdraw", "transfer", "mint", "redeem", "setFee"];

export function InvariantMonitor() {
  const [state, setState] = useState({ n: 0, shares: [420, 310, 270], supply: 1000, last: "deposit" });
  const { ref } = useLiveTick(() => {
    setState((s) => {
      const call = pick(calls);
      const shares = [...s.shares];
      if (call === "transfer") {
        const from = Math.floor(Math.random() * 3);
        const to = (from + 1) % 3;
        const amt = Math.min(shares[from], Math.floor(Math.random() * 60));
        shares[from] -= amt;
        shares[to] += amt;
      } else if (call === "deposit" || call === "mint") {
        shares[Math.floor(Math.random() * 3)] += Math.floor(Math.random() * 50);
      } else if (call === "withdraw" || call === "redeem") {
        const u = Math.floor(Math.random() * 3);
        shares[u] -= Math.min(shares[u], Math.floor(Math.random() * 50));
      }
      return { n: s.n + 1, shares, supply: shares.reduce((a, b) => a + b, 0), last: call };
    });
  }, 900);

  const sum = state.shares.reduce((a, b) => a + b, 0);
  const rules = [
    { rule: "Σ shares == totalShares", value: `${sum} == ${state.supply}` },
    { rule: "balance[user] ≥ 0", value: `min ${Math.min(...state.shares)}` },
    { rule: "transfer never changes supply", value: state.last === "transfer" ? "checked" : "watching" },
  ];

  return (
    <div ref={ref}>
      <Panel title="invariants · stateful run" status={<span className="tabular-nums">call #{state.n}</span>}>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] text-ink/60">
            <span>random call →</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={state.n}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded bg-paper-2 px-2 py-0.5 text-ink"
              >
                {state.last}()
              </motion.span>
            </AnimatePresence>
          </div>
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.rule} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5 font-mono text-[12px]">
                <span className="text-ink/80">{r.rule}</span>
                <span className="flex items-center gap-2 text-ink/50">
                  <span className="hidden tabular-nums sm:inline">{r.value}</span>
                  <motion.span
                    key={state.n}
                    initial={{ scale: 1.6, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-2 w-2 rounded-full bg-ok"
                  />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-paper-2">
            {state.shares.map((s, i) => (
              <motion.div
                key={i}
                animate={{ width: `${(s / Math.max(sum, 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className={["bg-flame", "bg-flame-soft", "bg-ink/70"][i]}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-ink/45">shares per user — the total always matches the pool</p>
        </div>
      </Panel>
    </div>
  );
}
