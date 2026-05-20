export const SESSION_COOKIE_NAME = "edumali_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface SessionPayload {
  uid: number;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "dev_only_session_secret_change_me_1234567890";
  }

  throw new Error("SESSION_SECRET manquant ou trop court (min 32 caracteres).");
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToText(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function textToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function timingSafeEqualText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function encodeSessionToken(payload: SessionPayload): Promise<string> {
  const payloadEncoded = textToBase64Url(JSON.stringify(payload));
  const signature = await sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export async function decodeSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadEncoded, signature] = token.split(".");
    if (!payloadEncoded || !signature) return null;

    const expected = await sign(payloadEncoded);
    if (!timingSafeEqualText(expected, signature)) return null;

    const payload = JSON.parse(base64UrlToText(payloadEncoded)) as SessionPayload;
    if (!Number.isInteger(payload.uid) || !Number.isInteger(payload.exp)) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
