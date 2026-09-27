import crypto from "node:crypto";
import ece from "http_ece";
import { describe, expect, it } from "vitest";
import { base64UrlToBytes, bytesToBase64Url } from "../../worker/src/encoding.js";
import { encryptPayload, isAllowedPushEndpoint, jwkFromRaw, sendWebPush, vapidAuthorization } from "../../worker/src/push/webpush.js";

// RFC 8291, Appendix A.
const RFC = {
  plaintext: "When I grow up, I want to be a watermelon",
  asPublic: "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8",
  asPrivate: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw",
  uaPublic: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4",
  uaPrivate: "q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94",
  salt: "DGv6ra1nlYgDCS1FRnbzlw",
  auth: "BTBZMqHH6r4Tts7J_aSIgg",
  body:
    "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN",
};

function decryptWithHttpEce(body, uaPrivate, auth) {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(uaPrivate, "base64url"));
  return ece.decrypt(Buffer.from(body), { version: "aes128gcm", privateKey: ecdh, authSecret: Buffer.from(auth, "base64url").toString("base64url") }).toString("utf8");
}

describe("encryptPayload (RFC 8291 aes128gcm)", () => {
  it("reproduces the RFC 8291 test vector byte for byte", async () => {
    const body = await encryptPayload(RFC.plaintext, RFC.uaPublic, RFC.auth, {
      salt: base64UrlToBytes(RFC.salt),
      serverKeys: { publicKey: RFC.asPublic, privateKey: RFC.asPrivate },
    });
    expect(bytesToBase64Url(body)).toBe(RFC.body);
  });

  it("is decryptable by an independent implementation with fresh keys", async () => {
    const ua = crypto.createECDH("prime256v1");
    ua.generateKeys();
    const auth = crypto.randomBytes(16).toString("base64url");
    const payload = JSON.stringify({ title: "NEURO//SCAN · Repaso", body: "Tienes 3 casos listos para repasar." });
    const body = await encryptPayload(payload, ua.getPublicKey().toString("base64url"), auth);
    expect(decryptWithHttpEce(body, ua.getPrivateKey().toString("base64url"), auth)).toBe(payload);
  });

  it("rejects a malformed auth secret", async () => {
    await expect(encryptPayload("x", RFC.uaPublic, "AAAA")).rejects.toThrow(/16 bytes/);
  });
});

describe("VAPID (RFC 8292)", () => {
  it("signs an ES256 JWT for the push service origin that verifies with the public key", async () => {
    const now = Date.UTC(2026, 0, 10);
    const header = await vapidAuthorization({ endpoint: "https://fcm.googleapis.com/fcm/send/xyz", subject: "mailto:a@b.c", publicKey: RFC.asPublic, privateKey: RFC.asPrivate, now });
    const [, jwt, k] = /^vapid t=([^,]+), k=(.+)$/.exec(header);
    expect(k).toBe(RFC.asPublic);
    const [h, c, s] = jwt.split(".");
    expect(JSON.parse(Buffer.from(h, "base64url"))).toEqual({ typ: "JWT", alg: "ES256" });
    expect(JSON.parse(Buffer.from(c, "base64url"))).toEqual({ aud: "https://fcm.googleapis.com", exp: now / 1000 + 12 * 3600, sub: "mailto:a@b.c" });
    const key = await crypto.subtle.importKey("jwk", jwkFromRaw(base64UrlToBytes(RFC.asPublic)), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, base64UrlToBytes(s), new TextEncoder().encode(`${h}.${c}`));
    expect(ok).toBe(true);
  });
});

describe("sendWebPush", () => {
  it("posts an encrypted body with the Web Push headers", async () => {
    const ua = crypto.createECDH("prime256v1");
    ua.generateKeys();
    const auth = crypto.randomBytes(16).toString("base64url");
    let captured;
    const result = await sendWebPush(
      { endpoint: "https://updates.push.services.mozilla.com/wpush/v2/abc", p256dh: ua.getPublicKey().toString("base64url"), auth },
      { title: "t", body: "b" },
      { VAPID_SUBJECT: "mailto:a@b.c", VAPID_PUBLIC_KEY: RFC.asPublic, VAPID_PRIVATE_KEY: RFC.asPrivate },
      async (url, init) => {
        captured = { url, init };
        return new Response(null, { status: 201 });
      },
    );
    expect(result).toEqual({ status: 201, ok: true });
    expect(captured.init.headers).toMatchObject({ "Content-Encoding": "aes128gcm", TTL: "43200" });
    expect(captured.init.headers.Authorization).toMatch(/^vapid t=.+, k=/);
    expect(JSON.parse(decryptWithHttpEce(captured.init.body, ua.getPrivateKey().toString("base64url"), auth))).toEqual({ title: "t", body: "b" });
  });
});

describe("isAllowedPushEndpoint", () => {
  it.each([
    ["https://fcm.googleapis.com/fcm/send/x", true],
    ["https://updates.push.services.mozilla.com/wpush/v2/x", true],
    ["https://web.push.apple.com/QG", true],
    ["https://db5p.notify.windows.com/w/?token=x", true],
    ["https://fcm.googleapis.com.evil.example/x", false],
    ["https://evilpush.apple.com.example/x", false],
    ["http://fcm.googleapis.com/x", false],
    ["https://169.254.169.254/latest", false],
    ["not a url", false],
  ])("%s → %s", (endpoint, allowed) => expect(isAllowedPushEndpoint(endpoint)).toBe(allowed));
});
