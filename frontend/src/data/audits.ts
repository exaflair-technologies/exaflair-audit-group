export type Tier = "silver" | "gold" | "platinum";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type IssueStatus = "resolved" | "partial" | "acknowledged" | "open";

export type Issue = {
  id: string; // e.g. "C-01"
  severity: Severity;
  title: string;
  status: IssueStatus;
  before: string; // what was wrong
  after: string; // what the fix changed
};

export type TimelineStep = { date: string; title: string; detail: string };

export type Audit = {
  slug: string;
  clientName: string;
  projectName: string;
  summary: string;
  tier: Tier;
  chain?: string;
  language?: string;
  startedAt: string; // ISO date
  auditedAt: string; // ISO date the report was delivered
  scope?: string;
  reportUrl?: string; // link to the report PDF (e.g. a Google Drive share link or /reports/x.pdf)
  clientLogoUrl?: string; // file in public/
  caseStudy: string[]; // paragraphs
  timeline: TimelineStep[];
  issues: Issue[];
};

export const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"];

export function findingsBySeverity(issues: Issue[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const i of issues) counts[i.severity] += 1;
  return counts;
}

export const findings = (a: Audit) => findingsBySeverity(a.issues);
export const totalFindings = (a: Audit) => a.issues.length;
export const getAudit = (slug: string) => audits.find((a) => a.slug === slug);

/** Published audits. Shown newest first on /portfolio, each with its own page at /portfolio/<slug>. */
export const audits: Audit[] = [
  {
    slug: "workchain-july-2026",
    clientName: "Workchain",
    projectName: "Workchain Escrow",
    summary:
      "Anchor/Solana escrow marketplace: job creation, proposals, work approval, arbitration and AWARD token rewards.",
    tier: "platinum",
    chain: "Solana",
    language: "Rust · Anchor",
    startedAt: "2026-07-07",
    auditedAt: "2026-07-12",
    scope: "programs/workchain/src",
    reportUrl: "https://drive.google.com/file/d/15HhmYbmfD01FbuWiKlXfGpTMuqUciVt3/view?usp=sharing",
    clientLogoUrl: "/partners/award.png",
    caseStudy: [
      "Workchain is an escrow marketplace on Solana. Clients post jobs and lock payment in escrow, whitelisted freelancers bid and deliver, vetted arbitrators settle disputes, and every approved job mints AWARD reputation tokens. Over six days in July 2026 we reviewed the full on-chain Anchor program, from job creation through to arbitration and rewards.",
      "Most of the risk sat in two places: how accounts were identified, and who was allowed to act. Job and proposal PDAs weren't fully seed-verified, so a client could only ever hold one job, and a crafted proposal account could front-run a real acceptance and lock the job. Whitelist checks were missing or inconsistent across freelancer and arbitrator flows, the whitelist instruction couldn't even be called, and there was no way to revoke access. The reward maths also used a logarithm approximation that drifted for high scores. The Workchain team fixed the issues and we re-checked every fix. Jobs now use unique seeds, every PDA is checked against its seeds and bump, a new admin-only blacklist instruction revokes access, and rewards use a checked log2 method.",
    ],
    timeline: [
      { date: "Jul 7", title: "Review starts", detail: "Scope frozen: the on-chain program in programs/workchain/src." },
      { date: "Jul 7 – 11", title: "Independent review", detail: "Researchers review the in-scope code independently and report what they find." },
      { date: "Jul 11 – 12", title: "Triage & judging", detail: "Every submission validated, duplicates merged, severities finalised." },
      { date: "Jul 12", title: "Report delivered", detail: "19 findings with impact, exploit path and a recommended fix for each." },
      { date: "Post-review", title: "Fix verification", detail: "The team's fix for each finding reviewed and its status recorded." },
    ],
    issues: [
      {
        id: "C-01",
        severity: "critical",
        title: "Inaccurate logarithm approximation",
        status: "resolved",
        before: "Rewards used ln(x) ≈ 2(x−1)/(x+1), which drifts badly as a freelancer's total score grows and distorts the reward curve.",
        after: "The logarithm now uses the log2 method (highest set bit × ln 2, scaled by 10⁶) with checked arithmetic at every step.",
      },
      {
        id: "C-02",
        severity: "critical",
        title: "Job PDA seed design restricts multiple jobs",
        status: "resolved",
        before: "Job PDAs were derived from the client key alone, so a client could only ever have one job and every lifecycle instruction pointed at the same account.",
        after: "Job PDAs now include a unique job id taken from the client's job counter and stored on the job account.",
      },
      {
        id: "C-03",
        severity: "critical",
        title: "Missing whitelist function exposure",
        status: "resolved",
        before: "The whitelist handler wasn't registered in lib.rs, so it couldn't be called, and it had no role check to stop clients being whitelisted.",
        after: "The instruction is registered, admin-only, accepts only Freelancer or Arbitrator roles and rejects users already whitelisted.",
      },
      {
        id: "C-04",
        severity: "critical",
        title: "Missing blacklisting mechanism",
        status: "resolved",
        before: "Once whitelisted, a user kept their privileges forever. There was no on-chain way to revoke a malicious freelancer or arbitrator.",
        after: "A new admin-only blacklist instruction clears the whitelist flag, which blocks proposals and arbitrator actions.",
      },
      {
        id: "H-01",
        severity: "high",
        title: "Invalid constraint on newly initialised proposal",
        status: "resolved",
        before: "A status constraint was checked on a proposal account marked init, so it read zeroed data rather than real state.",
        after: "The constraint is gone. The handler sets status to Pending once the fee is paid and records the rest of the proposal fields.",
      },
      {
        id: "H-02",
        severity: "high",
        title: "Precision loss due to integer division",
        status: "resolved",
        before: "The logarithm divided without scaling the numerator first, throwing away the fractional part of every reward.",
        after: "The dividing logarithm was removed. Rewards scale by 10⁶ before dividing, and a zero logarithm is replaced by 0.001.",
      },
      {
        id: "H-03",
        severity: "high",
        title: "Proposal PDA not seed-verified",
        status: "resolved",
        before: "Accept proposal only checked proposal.job, so a crafted proposal account could front-run a real acceptance and lock the job.",
        after: "The proposal account is now verified against its full seeds (proposal, job, freelancer) and its stored bump.",
      },
      {
        id: "H-04",
        severity: "high",
        title: "Missing whitelist validation for arbitrator",
        status: "resolved",
        before: "Registering as an Arbitrator was enough to resolve disputes. The whitelist flag was never read.",
        after: "Arbitrator approve and reject load the signer's own account and require both the Arbitrator role and the whitelist flag.",
      },
      {
        id: "M-01",
        severity: "medium",
        title: "Workchain minter PDA not seed-verified",
        status: "resolved",
        before: "The minter authority for AWARD CPIs was a plain AccountInfo, so any account could be passed in its place.",
        after: "In approve work and arbitrator approve, the minter is checked against its seeds (workchain_minter) and bump.",
      },
      {
        id: "M-02",
        severity: "medium",
        title: "Arbitrator wallet not bound to arbitrator signer",
        status: "partial",
        before: "The arbitrator fee went to a separate wallet account that was never checked against the signing arbitrator.",
        after: "Arbitrator approve now pays the signer directly. The reject path still takes an unchecked wallet account.",
      },
      {
        id: "M-03",
        severity: "medium",
        title: "Missing freelancer job count update",
        status: "resolved",
        before: "Approving a job didn't increase the freelancer's completed jobs count.",
        after: "Approval now increases the freelancer's and client's completed jobs counts with checked addition.",
      },
      {
        id: "M-04",
        severity: "medium",
        title: "Missing whitelist check for freelancer",
        status: "resolved",
        before: "Submit proposal checked the Freelancer role but not the whitelist flag, so unapproved freelancers could bid.",
        after: "Proposals now require the whitelist flag, and non-approved or blacklisted freelancers are rejected before any fee is charged.",
      },
      {
        id: "L-01",
        severity: "low",
        title: "Unsafe multiplication — possible overflow",
        status: "resolved",
        before: "Scaling the score by one million had no overflow check, so high-score freelancers could block job approval.",
        after: "The scaling step was removed, and every multiplication and addition in the logarithm is checked.",
      },
      {
        id: "L-02",
        severity: "low",
        title: "Escrow balance precaution check missing",
        status: "resolved",
        before: "Approval moved lamports out of escrow without first checking the escrow held enough.",
        after: "Approve work rejects a zero escrow amount and computes fee and payout with checked arithmetic.",
      },
      {
        id: "L-03",
        severity: "low",
        title: "Missing whitelist check for freelancer (submit work)",
        status: "partial",
        before: "Submit work checked the Freelancer role but not the whitelist flag.",
        after: "Submit work checks the role, the assigned freelancer and the deadline. The whitelist flag is still not checked here.",
      },
      {
        id: "L-04",
        severity: "low",
        title: "Missing escrow status validation in submit work",
        status: "resolved",
        before: "Work could be submitted without checking that the job's escrow was locked.",
        after: "Protected indirectly: submit work requires a Locked job, and only accept proposal sets Locked, funding the escrow in the same transaction.",
      },
      {
        id: "L-05",
        severity: "low",
        title: "Missing budget validation",
        status: "resolved",
        before: "Jobs could be created with a zero budget.",
        after: "Create job rejects a zero budget and validates deadline, difficulty (1–3) and multiplier (1–5).",
      },
      {
        id: "L-06",
        severity: "low",
        title: "Missing escrow amount validation before arbitrator fee",
        status: "resolved",
        before: "The 5% arbitrator fee was calculated without checking that the escrow held the job total.",
        after: "The fee comes from the escrow's recorded amount and a configurable fee setting, with checked arithmetic throughout.",
      },
      {
        id: "L-07",
        severity: "low",
        title: "Incorrect total jobs update for freelancer",
        status: "resolved",
        before: "Approval increased the freelancer's total jobs count, a field meant for jobs a client has created.",
        after: "Approval updates the freelancer's completed jobs count and total score instead.",
      },
    ],
  },
];
