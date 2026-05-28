export const API_BASE = "/api/secret";
export const REVEAL_TIMEOUT = 30;

export type ExpiryOption = { label: string; seconds: number };

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: "1 hour", seconds: 3600 },
  { label: "24 hours", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
];

export const DECOYS = [
  "DATABASE_URL=postgres://app:hunter2@db.internal:5432/prod\nSECRET_KEY=sk_live_4xKq9mN2pR7vL1jT8wQs\nSTRIPE_SECRET=sk_live_51NxKqBroken",
  "API_KEY=AIzaSyD-9tSrke72I6LOSyJmQP8FAKE\nDB_PASSWORD=Tr0ub4dor&3\nJWT_SECRET=hs256.supersecret.2024notreal",
  "GITHUB_TOKEN=ghp_xK9mNpR2qFAKETOKEN12345\nAWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET=wJalrXUtnFEMI/EXAMPLEKEY",
];

// Crockford base32 — excludes I, L, O, U to avoid visual misreads
const CB32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// 80-bit (10-byte) cryptographically random code, Crockford base32 encoded.
// 16 characters at 5 bits each = exactly 80 bits of entropy.
// Format: XXXX-XXXX-XXXX-XXXX
export function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  const chars = Array.from({ length: 16 }, () => {
    const c = CB32[Number(n & 31n)];
    n >>= 5n;
    return c;
  })
    .reverse()
    .join("");
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}-${chars.slice(12)}`;
}

export function wipeSecret(setFn: (v: string) => void): void {
  setFn("");
}
