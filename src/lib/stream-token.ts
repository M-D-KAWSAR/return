import { SignJWT, jwtVerify } from "jose";

export interface StreamTokenPayload {
  channelId: string;
  sessionId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.STREAM_TOKEN_SECRET;
  if (!secret) throw new Error("STREAM_TOKEN_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createStreamToken(
  payload: StreamTokenPayload
): Promise<string> {
  const ttl = parseInt(process.env.STREAM_TOKEN_TTL_SECONDS || "7200", 10);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getSecret());
}

export async function verifyStreamToken(
  token: string
): Promise<StreamTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.channelId !== "string" ||
      typeof payload.sessionId !== "string"
    ) {
      return null;
    }
    return {
      channelId: payload.channelId,
      sessionId: payload.sessionId,
    };
  } catch {
    return null;
  }
}

export function getStreamTokenTtl(): number {
  return parseInt(process.env.STREAM_TOKEN_TTL_SECONDS || "7200", 10);
}
