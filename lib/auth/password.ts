const PASSWORD_ALGORITHM = "PBKDF2";
const HASH_ALGORITHM = "SHA-256";
const ITERATIONS = 210_000;
const KEY_LENGTH_BITS = 256;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function derivePasswordKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    PASSWORD_ALGORITHM,
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: PASSWORD_ALGORITHM,
      hash: HASH_ALGORITHM,
      salt: saltBuffer,
      iterations: ITERATIONS,
    },
    passwordKey,
    KEY_LENGTH_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordKey(password, salt);
  return `pbkdf2:${bytesToBase64Url(salt)}:${bytesToBase64Url(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, saltValue, hashValue] = storedHash.split(":");
  if (algorithm !== "pbkdf2" || !saltValue || !hashValue) return false;

  const salt = base64UrlToBytes(saltValue);
  const expectedHash = base64UrlToBytes(hashValue);
  const actualHash = await derivePasswordKey(password, salt);

  return timingSafeEqualBytes(actualHash, expectedHash);
}
