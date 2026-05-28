import { API_BASE } from "@lib/constants";
import type { EncryptedPayload } from "@lib/crypto";

export type StoreParams = {
  id: string;
  payload: EncryptedPayload;
  decoy: string;
  expiry: number;
};

export type FetchResult =
  | { found: true; payload: EncryptedPayload }
  | { found: false; decoy: string | null };

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (res.status === 429) {
      const secs = body.retryAfter ?? parseInt(res.headers.get("Retry-After") ?? "60", 10);
      return `Rate limited. Try again in ${secs} seconds.`;
    }
    return body.error || fallback;
  } catch {
    return `${fallback} (${res.status})`;
  }
}

export async function apiStore(params: StoreParams): Promise<{ ok: true }> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res, "Store failed"));
  return res.json();
}

export async function apiFetch(id: string): Promise<FetchResult> {
  const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await parseError(res, "Fetch failed"));
  return res.json();
}
