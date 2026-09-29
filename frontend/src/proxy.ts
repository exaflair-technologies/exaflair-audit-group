import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Supabase isn't set up yet — serve pages without session handling.
  if (!supabaseConfigured) return NextResponse.next({ request });

  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
