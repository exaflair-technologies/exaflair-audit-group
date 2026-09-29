import type { NextRequest } from "next/server";
import { fail, ok } from "@/server/http";
import { getAuditBySlug } from "@/server/services/audits.service";

/** GET /api/audits/:slug — one published audit. 404 if it doesn't exist or isn't published. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/audits/[slug]">) {
  try {
    const { slug } = await ctx.params;
    return ok(await getAuditBySlug(slug));
  } catch (error) {
    return fail(error);
  }
}
