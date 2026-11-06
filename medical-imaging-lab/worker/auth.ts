export type Claims = {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  caseIds?: string[];
  role?: string;
};
const encoder = new TextEncoder();
function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function decode(value: string): string {
  return atob(
    value.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (value.length % 4)) % 4),
  );
}
async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
export async function sign(claims: Claims, secret: string): Promise<string> {
  if (secret.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  const header = base64url(
    encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const payload = base64url(encoder.encode(JSON.stringify(claims)));
  const data = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    encoder.encode(data),
  );
  return `${data}.${base64url(new Uint8Array(signature))}`;
}
export async function verify(
  token: string,
  secret: string,
  issuer: string,
  audience: string,
): Promise<Claims | null> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => !p || !/^[\w-]+$/.test(p)))
    return null;
  try {
    const [header, payload, signature] = parts as [string, string, string];
    if (JSON.parse(decode(header)).alg !== "HS256") return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      Uint8Array.from(decode(signature), (c) => c.charCodeAt(0)),
      encoder.encode(`${header}.${payload}`),
    );
    if (!valid) return null;
    const claims: unknown = JSON.parse(decode(payload));
    if (!claims || typeof claims !== "object") return null;
    const c = claims as Partial<Claims>;
    if (
      typeof c.sub !== "string" ||
      !/^[a-zA-Z0-9:_-]{1,100}$/.test(c.sub) ||
      c.iss !== issuer ||
      c.aud !== audience ||
      typeof c.exp !== "number" ||
      c.exp <= Date.now() / 1000 ||
      c.exp > Date.now() / 1000 + 3600
    )
      return null;
    return c as Claims;
  } catch {
    return null;
  }
}
export function cookieToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  return cookie.match(/(?:^|;\s*)gpa_lab_session=([^;]+)/)?.[1] || null;
}
