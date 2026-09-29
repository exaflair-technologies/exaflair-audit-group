import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "@/lib/supabase/config";
import { ServiceError } from "@/server/errors";

let client: SupabaseClient | undefined;

/**
 * Read-only Supabase client using the public anon key — no user session, no cookies.
 * Row-level security limits it to published audits and active partners.
 */
export function db(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new ServiceError(503, "SUPABASE_NOT_CONFIGURED", "Supabase is not configured");
  }
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Turns a Supabase query error into a 502 so callers see "upstream failed", not a crash. */
export function dbError(context: string, error: { message: string }): ServiceError {
  console.error(`[db] ${context}:`, error.message);
  return new ServiceError(502, "DATABASE_ERROR", `Could not load ${context}`);
}
