/**
 * FastAPI fetch wrapper — adds JWT from Supabase session.
 *
 * The FastAPI sidecar runs locally (localhost:8000) and reads local files
 * (PM2 status, git logs, token-usage.json). In production on Vercel, the
 * sidecar is unreachable — hooks that depend on it will get a clear error
 * so the UI can show a "connect locally" message instead of crashing.
 */

import { supabase } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** True when deployed to Vercel (no local sidecar available). */
export const IS_PRODUCTION = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (IS_PRODUCTION) {
    throw new Error("Local API — connect from localhost to use this feature.");
  }

  const auth = await getAuthHeader();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    signal: options?.signal ?? AbortSignal.timeout(5000),
    headers: {
      "Content-Type": "application/json",
      ...auth,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
