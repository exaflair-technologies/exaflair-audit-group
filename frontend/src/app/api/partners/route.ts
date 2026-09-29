import { fail, ok } from "@/server/http";
import { listPartners } from "@/server/services/partners.service";

/** GET /api/partners — active brand partners in display order. */
export async function GET() {
  try {
    return ok(await listPartners());
  } catch (error) {
    return fail(error);
  }
}
