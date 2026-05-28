import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
});
const dynamo = DynamoDBDocumentClient.from(client);

// ── Constants ────────────────────────────────────────────────────────────────

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_STORE = 10;
const RATE_MAX_FETCH = 20;

// base64-encoded AES-GCM ciphertext of 64 KB plaintext ≈ 88 KB; headroom for
// the password-wrapped-key fields; reject anything implausibly large.
const PAYLOAD_DATA_MAX = 131_072; // 128 KB base64 chars for .data
const PAYLOAD_FIELD_MAX = 1_024; // iv, salt, pwSalt, pwIv, wrappedKey
const DECOY_MAX = 4_096; // decoy fake-credential string

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
};

// ── Types ────────────────────────────────────────────────────────────────────

type EncryptedPayload = {
  data: string;
  iv: string;
  salt: string;
  passwordProtected: boolean;
  pwSalt?: string;
  pwIv?: string;
  wrappedKey?: string;
};

// ── Rate limiting (DynamoDB atomic counters) ─────────────────────────────────
// Each window key is `rl:{ip}:{action}:{minute}`. An atomic ADD increments the
// counter; if the returned count exceeds the limit the request is rejected.
// Using DynamoDB ensures rate limits survive function cold-starts and hold
// across multiple concurrent server instances.

async function isRateLimited(
  ip: string,
  action: "store" | "fetch",
): Promise<boolean> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return false; // misconfiguration — handlers reject with 500 anyway
  const window = Math.floor(Date.now() / RATE_WINDOW_MS);
  const pk = `rl:${ip}:${action}:${window}`;
  const limit = action === "store" ? RATE_MAX_STORE : RATE_MAX_FETCH;
  try {
    const result = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { pk },
        // SET ttl only on first write so the record expires ~2 min after the
        // window opens. ADD atomically increments (or initialises to 1).
        UpdateExpression:
          "SET #ttl = if_not_exists(#ttl, :ttl) ADD #count :one",
        ExpressionAttributeNames: { "#count": "count", "#ttl": "ttl" },
        ExpressionAttributeValues: {
          ":one": 1,
          ":ttl": Math.floor(Date.now() / 1000) + 120,
        },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    return ((result.Attributes?.count as number) ?? 0) > limit;
  } catch (e) {
    // Fail open on DynamoDB error — availability > perfect rate limiting.
    console.error("[rate-limit] DynamoDB error, failing open:", e);
    return false;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidId(id: string): boolean {
  return /^[a-f0-9]{16}$/.test(id);
}

function getIp(request: Request): string {
  // x-real-ip is set by trusted reverse proxies (Vercel, nginx) and cannot be
  // forged by the client. Fall back to the LAST entry of x-forwarded-for
  // (appended by the outermost trusted proxy) rather than the first (which a
  // client can spoof by pre-setting the header).
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").at(-1)?.trim();
  return last ?? "unknown";
}

function isValidBase64(s: string): boolean {
  return /^[A-Za-z0-9+/]+=*$/.test(s);
}

function isValidPayload(p: unknown): p is EncryptedPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (
    typeof o.data !== "string" ||
    !isValidBase64(o.data) ||
    o.data.length > PAYLOAD_DATA_MAX
  )
    return false;
  if (
    typeof o.iv !== "string" ||
    !isValidBase64(o.iv) ||
    o.iv.length > PAYLOAD_FIELD_MAX
  )
    return false;
  if (
    typeof o.salt !== "string" ||
    !isValidBase64(o.salt) ||
    o.salt.length > PAYLOAD_FIELD_MAX
  )
    return false;
  if (typeof o.passwordProtected !== "boolean") return false;
  if (o.passwordProtected) {
    if (
      typeof o.pwSalt !== "string" ||
      !isValidBase64(o.pwSalt) ||
      o.pwSalt.length > PAYLOAD_FIELD_MAX
    )
      return false;
    if (
      typeof o.pwIv !== "string" ||
      !isValidBase64(o.pwIv) ||
      o.pwIv.length > PAYLOAD_FIELD_MAX
    )
      return false;
    if (
      typeof o.wrappedKey !== "string" ||
      !isValidBase64(o.wrappedKey) ||
      o.wrappedKey.length > PAYLOAD_FIELD_MAX * 4
    )
      return false;
  }
  return true;
}

function safeError(msg: string): string {
  return process.env.NODE_ENV === "production" ? "Internal error." : msg;
}

function json(body: unknown, status: number, extra?: Record<string, string>): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...extra } });
}

function rateLimitedResponse(): Response {
  const retryAfter = RATE_WINDOW_MS / 1000;
  return json(
    { error: "Too many requests. Try again in a minute.", retryAfter },
    429,
    { "Retry-After": String(retryAfter) },
  );
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return json({ error: "Server misconfiguration." }, 500);

  // Enforce JSON content-type
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return json({ error: "Content-Type must be application/json." }, 415);

  const ip = getIp(request);
  if (await isRateLimited(ip, "store")) return rateLimitedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  if (!body || typeof body !== "object")
    return json({ error: "Invalid request body." }, 400);

  const { id, payload, decoy, expiry } = body as {
    id?: unknown;
    payload?: unknown;
    decoy?: unknown;
    expiry?: unknown;
  };

  if (!id || !payload || expiry === undefined)
    return json({ error: "Missing required fields." }, 400);
  if (typeof id !== "string" || !isValidId(id))
    return json({ error: "Invalid ID format." }, 400);
  if (
    typeof expiry !== "number" ||
    !Number.isInteger(expiry) ||
    expiry < 3600 ||
    expiry > 2592000
  )
    return json({ error: "Invalid expiry." }, 400);
  if (!isValidPayload(payload))
    return json({ error: "Invalid payload structure." }, 400);
  if (decoy !== undefined) {
    if (typeof decoy !== "string" || decoy.length > DECOY_MAX)
      return json({ error: "Invalid decoy." }, 400);
  }

  const ttl = Math.floor(Date.now() / 1000) + expiry;

  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE,
        Item: { pk: `hl:${id}`, payload: JSON.stringify(payload), ttl },
        // Prevent overwriting an existing secret with the same ID
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    );
    if (decoy) {
      await dynamo.send(
        new PutCommand({
          TableName: TABLE,
          Item: { pk: `hld:${id}`, decoy, ttl },
        }),
      );
    }
  } catch (e) {
    const msg =
      (e as Error).name === "ConditionalCheckFailedException"
        ? "ID collision — please retry."
        : safeError((e as Error).message);
    return json({ error: msg }, 500);
  }

  return json({ ok: true }, 200);
}

export async function GET(request: Request): Promise<Response> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return json({ error: "Server misconfiguration." }, 500);

  const ip = getIp(request);
  if (await isRateLimited(ip, "fetch")) return rateLimitedResponse();

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !isValidId(id)) return json({ error: "Invalid ID." }, 400);

  // Atomic fetch-and-delete — DynamoDB equivalent of Redis GETDEL
  let item: Record<string, unknown> | undefined;
  try {
    const result = await dynamo.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { pk: `hl:${id}` },
        ReturnValues: "ALL_OLD",
      }),
    );
    item = result.Attributes;
  } catch (e) {
    return json({ error: safeError((e as Error).message) }, 500);
  }

  if (!item) {
    let decoy: string | null = null;
    try {
      const res = await dynamo.send(
        new GetCommand({ TableName: TABLE, Key: { pk: `hld:${id}` } }),
      );
      decoy = typeof res.Item?.decoy === "string" ? res.Item.decoy : null;
    } catch (e) {
      console.error("[decoy-fetch] DynamoDB error:", e);
    }
    return json({ found: false, decoy }, 200);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(item.payload as string);
  } catch {
    return json({ error: "Corrupt record." }, 500);
  }

  return json({ found: true, payload }, 200);
}
