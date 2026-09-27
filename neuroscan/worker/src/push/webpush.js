import { base64UrlToBytes, bytesToBase64Url, concatBytes, utf8 } from "../encoding.js";

const RECORD_SIZE = 4096;
const P256 = { name: "ECDH", namedCurve: "P-256" };

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}

export function jwkFromRaw(publicRaw, privateD) {
  if (publicRaw.length !== 65 || publicRaw[0] !== 4) throw new Error("La clave pública debe ser un punto P-256 sin comprimir");
  const jwk = { kty: "EC", crv: "P-256", x: bytesToBase64Url(publicRaw.slice(1, 33)), y: bytesToBase64Url(publicRaw.slice(33, 65)), ext: true };
  if (privateD) jwk.d = privateD;
  return jwk;
}

// RFC 8291 (Message Encryption for Web Push) with the RFC 8188 aes128gcm content coding,
// as a single record. `salt` and `serverKeys` are injectable only so tests can use the RFC vector.
export async function encryptPayload(plaintext, p256dhB64, authB64, { salt = crypto.getRandomValues(new Uint8Array(16)), serverKeys } = {}) {
  const uaPublicRaw = base64UrlToBytes(p256dhB64);
  const authSecret = base64UrlToBytes(authB64);
  if (authSecret.length !== 16) throw new Error("auth debe tener 16 bytes");
  const uaPublic = await crypto.subtle.importKey("raw", uaPublicRaw, P256, false, []);
  let asPrivate;
  let asPublicRaw;
  if (serverKeys) {
    asPublicRaw = base64UrlToBytes(serverKeys.publicKey);
    asPrivate = await crypto.subtle.importKey("jwk", jwkFromRaw(asPublicRaw, serverKeys.privateKey), P256, false, ["deriveBits"]);
  } else {
    const pair = await crypto.subtle.generateKey(P256, true, ["deriveBits"]);
    asPrivate = pair.privateKey;
    asPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  }
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaPublic }, asPrivate, 256));
  const keyInfo = concatBytes(utf8("WebPush: info\0"), uaPublicRaw, asPublicRaw);
  const ikm = await hkdf(authSecret, shared, keyInfo, 32);
  const cek = await hkdf(salt, ikm, utf8("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, utf8("Content-Encoding: nonce\0"), 12);
  const data = typeof plaintext === "string" ? utf8(plaintext) : plaintext;
  if (data.length > RECORD_SIZE - 17 - 86) throw new Error("Payload demasiado grande para un registro");
  const padded = concatBytes(data, new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));
  const header = new Uint8Array(21);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, RECORD_SIZE);
  header[20] = asPublicRaw.length;
  return concatBytes(header, asPublicRaw, ciphertext);
}

const signingKeys = new Map();

async function vapidSigningKey(publicKey, privateKey) {
  const cacheKey = `${publicKey}.${privateKey}`;
  if (!signingKeys.has(cacheKey)) {
    const jwk = jwkFromRaw(base64UrlToBytes(publicKey), privateKey);
    signingKeys.set(cacheKey, crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]));
  }
  return signingKeys.get(cacheKey);
}

// RFC 8292 VAPID: an ES256 JWT scoped to the push service origin.
export async function vapidAuthorization({ endpoint, subject, publicKey, privateKey, now = Date.now() }) {
  const header = bytesToBase64Url(utf8(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToBase64Url(utf8(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject })));
  const unsigned = `${header}.${claims}`;
  const key = await vapidSigningKey(publicKey, privateKey);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, utf8(unsigned));
  return `vapid t=${unsigned}.${bytesToBase64Url(signature)}, k=${publicKey}`;
}

export async function sendWebPush(subscription, payload, env, fetchImpl = fetch) {
  const body = await encryptPayload(JSON.stringify(payload), subscription.p256dh, subscription.auth);
  const authorization = await vapidAuthorization({
    endpoint: subscription.endpoint,
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  });
  const response = await fetchImpl(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      TTL: "43200",
      Urgency: "normal",
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
    },
    body,
  });
  return { status: response.status, ok: response.ok };
}

// Only real browser push services may be targeted, so a subscription cannot turn the
// Worker into a request relay towards arbitrary hosts.
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^([a-z0-9-]+\.)*push\.apple\.com$/, /^([a-z0-9-]+\.)*notify\.windows\.com$/];

export function isAllowedPushEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && !url.port && PUSH_HOSTS.some((re) => re.test(url.hostname));
  } catch {
    return false;
  }
}
