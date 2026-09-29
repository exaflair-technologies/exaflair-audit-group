import "server-only";
import { db, dbError } from "@/server/db";
import { badRequest, notFound } from "@/server/errors";

export const TIERS = ["silver", "gold", "platinum"] as const;
export type Tier = (typeof TIERS)[number];

export const SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;
export type Severity = (typeof SEVERITIES)[number];

export type Audit = {
  id: string;
  slug: string;
  clientName: string;
  projectName: string;
  summary: string | null;
  tier: Tier;
  chain: string | null;
  language: string | null;
  auditedAt: string; // ISO date
  publishedAt: string | null;
  repoUrl: string | null;
  reportUrl: string | null; // short-lived signed URL, null if no report uploaded
  clientLogoUrl: string | null;
  findings: Record<Severity, number>;
  totalFindings: number;
};

export type AuditStats = {
  audits: number;
  totalFindings: number;
  bySeverity: Record<Severity, number>;
  byTier: Record<Tier, number>;
};

export type ListAuditsOptions = { tier?: Tier; limit?: number; offset?: number };

const REPORTS_BUCKET = "audit-reports";
const LOGOS_BUCKET = "partner-logos";
const REPORT_URL_TTL_SECONDS = 60 * 60;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const COLUMNS =
  "id, slug, client_name, project_name, summary, tier, chain, language, audited_at, published_at, repo_url, report_path, client_logo_path, critical_count, high_count, medium_count, low_count, info_count, total_findings";

type AuditRow = {
  id: string;
  slug: string;
  client_name: string;
  project_name: string;
  summary: string | null;
  tier: Tier;
  chain: string | null;
  language: string | null;
  audited_at: string;
  published_at: string | null;
  repo_url: string | null;
  report_path: string | null;
  client_logo_path: string | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  total_findings: number;
};

export function parseTier(value: string | null): Tier | undefined {
  if (value === null || value === "") return undefined;
  if (!(TIERS as readonly string[]).includes(value)) {
    throw badRequest(`"tier" must be one of: ${TIERS.join(", ")}`);
  }
  return value as Tier;
}

/** Reports sit in a private bucket; sign every path in one request. Missing signatures map to null. */
async function signReports(paths: string[]): Promise<Map<string, string>> {
  const signed = new Map<string, string>();
  if (paths.length === 0) return signed;
  const { data, error } = await db().storage.from(REPORTS_BUCKET).createSignedUrls(paths, REPORT_URL_TTL_SECONDS);
  // A signing failure shouldn't hide the audit itself — it just shows without a download link.
  if (error) console.error("[audits] could not sign report URLs:", error.message);
  data?.forEach((d) => d.path && d.signedUrl && signed.set(d.path, d.signedUrl));
  return signed;
}

function toAudit(row: AuditRow, signed: Map<string, string>): Audit {
  return {
    id: row.id,
    slug: row.slug,
    clientName: row.client_name,
    projectName: row.project_name,
    summary: row.summary,
    tier: row.tier,
    chain: row.chain,
    language: row.language,
    auditedAt: row.audited_at,
    publishedAt: row.published_at,
    repoUrl: row.repo_url,
    reportUrl: row.report_path ? (signed.get(row.report_path) ?? null) : null,
    clientLogoUrl: row.client_logo_path
      ? db().storage.from(LOGOS_BUCKET).getPublicUrl(row.client_logo_path).data.publicUrl
      : null,
    findings: {
      critical: row.critical_count,
      high: row.high_count,
      medium: row.medium_count,
      low: row.low_count,
      info: row.info_count,
    },
    totalFindings: row.total_findings,
  };
}

/** Published audits, newest first, optionally filtered by tier. */
export async function listAudits({ tier, limit = 50, offset = 0 }: ListAuditsOptions = {}) {
  let query = db()
    .from("audits")
    .select(COLUMNS, { count: "exact" })
    .eq("is_published", true)
    .order("audited_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (tier) query = query.eq("tier", tier);

  const { data, error, count } = await query.returns<AuditRow[]>();
  if (error) throw dbError("audits", error);

  const signed = await signReports(data.map((r) => r.report_path).filter((p): p is string => Boolean(p)));
  return { audits: data.map((r) => toAudit(r, signed)), total: count ?? data.length, limit, offset };
}

/** One published audit by slug. */
export async function getAuditBySlug(slug: string): Promise<Audit> {
  if (!SLUG_RE.test(slug)) throw notFound("Audit");

  const { data, error } = await db()
    .from("audits")
    .select(COLUMNS)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle<AuditRow>();
  if (error) throw dbError("audit", error);
  if (!data) throw notFound("Audit");

  const signed = await signReports(data.report_path ? [data.report_path] : []);
  return toAudit(data, signed);
}

/** Totals across every published audit. */
export async function getAuditStats(): Promise<AuditStats> {
  const { data, error } = await db()
    .from("audits")
    .select("tier, critical_count, high_count, medium_count, low_count, info_count, total_findings")
    .eq("is_published", true)
    .returns<Pick<AuditRow, "tier" | "critical_count" | "high_count" | "medium_count" | "low_count" | "info_count" | "total_findings">[]>();
  if (error) throw dbError("audit stats", error);

  const stats: AuditStats = {
    audits: data.length,
    totalFindings: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    byTier: { silver: 0, gold: 0, platinum: 0 },
  };
  for (const r of data) {
    stats.totalFindings += r.total_findings;
    stats.bySeverity.critical += r.critical_count;
    stats.bySeverity.high += r.high_count;
    stats.bySeverity.medium += r.medium_count;
    stats.bySeverity.low += r.low_count;
    stats.bySeverity.info += r.info_count;
    stats.byTier[r.tier] += 1;
  }
  return stats;
}
