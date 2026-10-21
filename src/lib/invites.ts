import crypto from "crypto";

const INVITE_SECRET =
  process.env.INVITE_SECRET ||
  process.env.AUTH_SECRET ||
  "ethiolink-creator-invite-token-secret-production";

export interface InvitePayload {
  campaignId: string;
  brandId: string;
  creatorName?: string;
  exp: number; // Expiration timestamp in ms
}

/**
 * Creates a signed, tamper-resistant magic invite token for a creator
 */
export function createCreatorInviteToken(
  campaignId: string,
  brandId: string,
  creatorName?: string,
  expiresInMs: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): string {
  const payload: InvitePayload = {
    campaignId,
    brandId,
    creatorName: creatorName?.trim() || undefined,
    exp: Date.now() + expiresInMs,
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "INVITE" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", INVITE_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies a creator magic invite token
 */
export function verifyCreatorInviteToken(token: string): InvitePayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", INVITE_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as InvitePayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Normalizes a title into a URL-friendly slug
 */
export function slugify(text: string): string {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -

  return base || `campaign-${Date.now().toString(36)}`;
}
