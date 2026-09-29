import type { NextRequest } from "next/server";
import { fail, intParam, ok } from "@/server/http";
import { listAudits, parseTier } from "@/server/services/audits.service";

/**
 * GET /api/audits?tier=gold&limit=20&offset=0
 * Published audits, newest first. `tier` is optional; `limit` 1–100 (default 50).
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const { audits, total, limit, offset } = await listAudits({
      tier: parseTier(params.get("tier")),
      limit: intParam(params, "limit", 50, 1, 100),
      offset: intParam(params, "offset", 0, 0, 100_000),
    });
    return ok(audits, { total, limit, offset });
  } catch (error) {
    return fail(error);
  }
}
