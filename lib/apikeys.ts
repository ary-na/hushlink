import { createHash, randomBytes } from "crypto";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export function generateApiKey(): { key: string; keyId: string; hash: string } {
  const bytes = randomBytes(20); // 160 bits of entropy
  const hex = bytes.toString("hex");
  const key = `hl_${hex}`;
  const keyId = hex.slice(0, 8);
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, keyId, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(
  key: string,
  dynamo: DynamoDBDocumentClient,
  TABLE: string,
): Promise<{ valid: boolean; keyId?: string }> {
  if (!/^hl_[a-f0-9]{40}$/.test(key)) return { valid: false };
  const hash = hashApiKey(key);
  try {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE, Key: { pk: `akh:${hash}` } }),
    );
    if (!result.Item) return { valid: false };
    return { valid: true, keyId: result.Item.keyId as string };
  } catch {
    return { valid: false };
  }
}
