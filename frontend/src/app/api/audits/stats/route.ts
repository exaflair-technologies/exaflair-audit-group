import { fail, ok } from "@/server/http";
import { getAuditStats } from "@/server/services/audits.service";

/** GET /api/audits/stats — totals across published audits, by severity and by tier. */
export async function GET() {
  try {
    return ok(await getAuditStats());
  } catch (error) {
    return fail(error);
  }
}
