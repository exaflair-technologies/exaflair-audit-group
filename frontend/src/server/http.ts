import "server-only";
import { NextResponse } from "next/server";
import { ServiceError, badRequest } from "@/server/errors";

// Short CDN cache: data changes rarely, and signed report URLs outlive this by far.
const CACHE_HEADER = "public, s-maxage=60, stale-while-revalidate=300";

/** Success envelope: `{ data, meta? }`. */
export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json(meta ? { data, meta } : { data }, {
    headers: { "Cache-Control": CACHE_HEADER },
  });
}

/** Error envelope: `{ error: { code, message } }`. Unknown errors become a generic 500. */
export function fail(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error("[api] unexpected error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 },
  );
}

/** Reads an optional integer query param and checks it's within [min, max]. */
export function intParam(params: URLSearchParams, name: string, fallback: number, min: number, max: number) {
  const raw = params.get(name);
  if (raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw badRequest(`"${name}" must be an integer between ${min} and ${max}`);
  }
  return n;
}
