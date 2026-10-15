import { NextResponse } from "next/server";
import { clientIp, rateLimited } from "./ratelimit";
import { SITE } from "./site";

export const err = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
export const notConfigured = () =>
  err(`Our enquiry system is not connected yet. Please email us directly at ${SITE.email}.`, 503);

/** Shared guard: parse JSON, rate-limit by IP, silently accept bot submissions that fill the hidden field. */
export async function guard(req: Request, scope: string, max = 5) {
  if (rateLimited(`${scope}:${clientIp(req)}`, max)) return { response: err("Too many requests. Please wait a few minutes and try again.", 429) } as const;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return { response: err("Invalid request.") } as const; }
  if (typeof body.website === "string" && body.website.trim() !== "") return { response: NextResponse.json({ ok: true }) } as const;
  return { body } as const;
}
