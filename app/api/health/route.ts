import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION ?? "ap-southeast-2",
  ...(process.env.DYNAMO_ACCESS_KEY && {
    credentials: {
      accessKeyId: process.env.DYNAMO_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMO_SECRET_KEY!,
    },
  }),
});
const dynamo = DynamoDBDocumentClient.from(client);

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };

export async function GET(): Promise<Response> {
  const TABLE = process.env.DYNAMODB_TABLE;
  if (!TABLE) {
    return Response.json({ ok: false, error: "misconfigured" }, { status: 500, headers: NO_STORE });
  }

  try {
    await dynamo.send(new GetCommand({ TableName: TABLE, Key: { pk: "__health__" } }));
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch {
    return Response.json({ ok: false, error: "database" }, { status: 503, headers: NO_STORE });
  }
}
