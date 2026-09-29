import "server-only";
import { db, dbError } from "@/server/db";

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
};

type PartnerRow = { id: string; name: string; logo_path: string; website_url: string | null };

const LOGOS_BUCKET = "partner-logos";

/** Active partners in display order (sort_order, then name). */
export async function listPartners(): Promise<Partner[]> {
  const { data, error } = await db()
    .from("partners")
    .select("id, name, logo_path, website_url")
    .eq("is_active", true)
    .order("sort_order")
    .order("name")
    .returns<PartnerRow[]>();
  if (error) throw dbError("partners", error);

  const logos = db().storage.from(LOGOS_BUCKET);
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: logos.getPublicUrl(p.logo_path).data.publicUrl,
    websiteUrl: p.website_url,
  }));
}
