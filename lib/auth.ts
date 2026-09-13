import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

type Runtime = { DB: D1Database; SITE_PASSWORD: string; VAULT_KEY: string };
export function runtime(): Runtime {
  const value = env as unknown as Runtime;
  if (!value.DB || !value.SITE_PASSWORD || !value.VAULT_KEY) throw new Error("Site configuration unavailable");
  return value;
}
export async function digest(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map(n=>n.toString(16).padStart(2,"0")).join("");
}
export async function hasSession() {
  const token = (await cookies()).get("light_session")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const row = await runtime().DB.prepare("SELECT expires FROM sessions WHERE token_hash = ? AND expires > ?").bind(await digest(token),Date.now()).first();
  return !!row;
}
export const privateHeaders = {"Cache-Control":"private, no-store, max-age=0", "X-Robots-Tag":"noindex, nofollow, noarchive", "X-Content-Type-Options":"nosniff"};
export function sameOrigin(request:Request) {
  const origin=request.headers.get("origin");
  return !!origin && origin===new URL(request.url).origin;
}
