// Server-only: env vars without NEXT_PUBLIC_ are undefined in client bundles, so keep this out of audits.ts.

/** Report PDF link for an audit, from REPORT_URL_<SLUG> (e.g. workchain-july-2026 → REPORT_URL_WORKCHAIN_JULY_2026). */
export function getReportUrl(slug: string): string | undefined {
  const key = `REPORT_URL_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return process.env[key]?.trim() || undefined;
}
