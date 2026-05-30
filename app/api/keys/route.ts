import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { generateApiKey, hashApiKey } from "@lib/apikeys";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
});
const dynamo = DynamoDBDocumentClient.from(client);

const RATE_WINDOW_MS = 3_600_000; // 1 hour
const RATE_MAX_CREATE = 5;

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
};

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

function getIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",").at(-1)?.trim() ?? "unknown";
}

async function isRateLimited(ip: string): Promise<boolean> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return false;
  const window = Math.floor(Date.now() / RATE_WINDOW_MS);
  const pk = `rl:${ip}:keyCreate:${window}`;
  try {
    const result = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { pk },
        UpdateExpression:
          "SET #ttl = if_not_exists(#ttl, :ttl) ADD #count :one",
        ExpressionAttributeNames: { "#count": "count", "#ttl": "ttl" },
        ExpressionAttributeValues: {
          ":one": 1,
          ":ttl": Math.floor(Date.now() / 1000) + 7200,
        },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    return ((result.Attributes?.count as number) ?? 0) > RATE_MAX_CREATE;
  } catch {
    return false;
  }
}

// ── POST /api/keys — create a new API key ────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return json({ error: "Server misconfiguration." }, 500);

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return json({ error: "Content-Type must be application/json." }, 415);

  const ip = getIp(request);
  if (await isRateLimited(ip))
    return json({ error: "Too many keys created. Try again in an hour." }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const raw = (body as Record<string, unknown>)?.name;
  const name =
    typeof raw === "string" ? raw.slice(0, 64).trim() || "unnamed" : "unnamed";

  const { key, keyId, hash } = generateApiKey();
  const createdAt = new Date().toISOString();

  try {
    // Validation record — looked up by hash on every authenticated request
    await dynamo.send(
      new PutCommand({
        TableName: TABLE,
        Item: { pk: `akh:${hash}`, keyId, name, createdAt },
      }),
    );
    // Management record — looked up by keyId for revocation
    await dynamo.send(
      new PutCommand({
        TableName: TABLE,
        Item: { pk: `ak:${keyId}`, hash, name, createdAt },
      }),
    );
  } catch {
    return json({ error: "Failed to create key." }, 500);
  }

  return json({ keyId, key, name, createdAt }, 201);
}

// ── DELETE /api/keys — revoke a key (full key proves ownership) ───────────────

export async function DELETE(request: Request): Promise<Response> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) return json({ error: "Server misconfiguration." }, 500);

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return json({ error: "Content-Type must be application/json." }, 415);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const key =
    typeof (body as Record<string, unknown>)?.key === "string"
      ? ((body as Record<string, unknown>).key as string)
      : null;

  if (!key || !/^hl_[a-f0-9]{40}$/.test(key))
    return json({ error: "Invalid key format." }, 400);

  const hash = hashApiKey(key);
  const keyId = key.slice(3, 11); // first 8 hex chars after "hl_"

  try {
    await dynamo.send(
      new DeleteCommand({ TableName: TABLE, Key: { pk: `akh:${hash}` } }),
    );
    await dynamo.send(
      new DeleteCommand({ TableName: TABLE, Key: { pk: `ak:${keyId}` } }),
    );
  } catch {
    return json({ error: "Failed to revoke key." }, 500);
  }

  return json({ ok: true, revoked: keyId }, 200);
}
