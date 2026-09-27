import { beforeEach, describe, expect, it } from "vitest";
import worker from "../../worker/src/index.js";
import { createD1 } from "./d1-shim.js";

const P256DH = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";
const AUTH = "BTBZMqHH6r4Tts7J_aSIgg";
const FCM = "https://fcm.googleapis.com/fcm/send/abc123";

let env;

function call(method, path, { token, body, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };
  if (token) init.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    init.headers["Content-Type"] = "application/json";
  }
  return worker.fetch(new Request(`https://neuroscan.test/api/v1${path}`, init), env);
}

async function account() {
  const res = await call("POST", "/accounts");
  expect(res.status).toBe(201);
  return res.json();
}

const progress = (overrides = {}) => ({ version: 2, updatedAt: Date.now(), done: [1], answers: { 1: 100 }, activityDays: ["2026-01-10"], ...overrides });

beforeEach(() => {
  env = {
    DB: createD1(),
    VAPID_PUBLIC_KEY: "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8",
    VAPID_PRIVATE_KEY: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw",
    VAPID_SUBJECT: "mailto:test@example.com",
    ADMIN_TOKEN: "admin-secret-token",
    ALLOWED_ORIGINS: "https://lms.example.com",
    ASSETS: { fetch: () => new Response("asset") },
  };
});

describe("routing and HTTP hygiene", () => {
  it("serves static assets outside /api", async () => {
    const res = await worker.fetch(new Request("https://neuroscan.test/index.html"), env);
    expect(await res.text()).toBe("asset");
  });

  it("returns JSON 404 and 405", async () => {
    expect((await call("GET", "/nope")).status).toBe(404);
    expect((await call("PATCH", "/progress")).status).toBe(405);
  });

  it("marks API responses as non-cacheable and nosniff", async () => {
    const res = await call("GET", "/health");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await res.json()).toMatchObject({ ok: true, challenges: 98, push: true });
  });

  it("only answers CORS for configured origins", async () => {
    const ok = await call("OPTIONS", "/progress", { headers: { Origin: "https://lms.example.com" } });
    expect(ok.status).toBe(204);
    expect(ok.headers.get("Access-Control-Allow-Origin")).toBe("https://lms.example.com");
    const denied = await call("OPTIONS", "/progress", { headers: { Origin: "https://evil.example" } });
    expect(denied.status).toBe(403);
    const plain = await call("GET", "/health", { headers: { Origin: "https://evil.example" } });
    expect(plain.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("rejects malformed and oversized bodies", async () => {
    const { token } = await account();
    expect((await call("PUT", "/progress", { token, body: "{nope" })).status).toBe(400);
    expect((await call("PUT", "/progress", { token, body: { baseRev: 0, state: { pad: "x".repeat(300_000) } } })).status).toBe(413);
  });

  it("applies the optional rate limiter to anonymous endpoints", async () => {
    env.RATE_LIMITER = { limit: async () => ({ success: false }) };
    expect((await call("POST", "/accounts")).status).toBe(429);
  });
});

describe("accounts and auth", () => {
  it("stores only a hash of the device token", async () => {
    const { token, userId } = await account();
    const row = env.DB.raw.prepare("SELECT token_hash FROM devices WHERE user_id = ?").get(userId);
    expect(row.token_hash).not.toContain(token);
    expect(row.token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("requires a valid bearer token", async () => {
    expect((await call("GET", "/progress")).status).toBe(401);
    expect((await call("GET", "/progress", { token: "x".repeat(43) })).status).toBe(401);
  });

  it("deletes every trace of an account", async () => {
    const { token, userId } = await account();
    await call("PUT", "/progress", { token, body: { baseRev: 0, state: progress() } });
    await call("PUT", "/push/subscription", { token, body: { subscription: { endpoint: FCM, keys: { p256dh: P256DH, auth: AUTH } }, reminderTime: "19:00", timezone: "America/Santo_Domingo" } });
    await call("POST", "/pairing", { token });
    expect((await call("DELETE", "/account", { token })).status).toBe(204);
    for (const table of ["users", "devices", "progress", "push_subscriptions", "pairing_codes"]) {
      const column = table === "users" ? "id" : "user_id";
      expect(env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column} = ?`).get(userId).n).toBe(0);
    }
    expect((await call("GET", "/progress", { token })).status).toBe(401);
  });
});

describe("progress sync", () => {
  it("starts empty, then stores a sanitized snapshot", async () => {
    const { token } = await account();
    expect(await (await call("GET", "/progress", { token })).json()).toEqual({ rev: 0, state: null });
    const put = await call("PUT", "/progress", { token, body: { baseRev: 0, state: progress({ done: [1, 999, "x"], evil: "<script>" }) } });
    expect(await put.json()).toEqual({ rev: 1 });
    const { rev, state } = await (await call("GET", "/progress", { token })).json();
    expect(rev).toBe(1);
    expect(state.done).toEqual([1]);
    expect(state.evil).toBeUndefined();
  });

  it("detects concurrent writers and returns the current snapshot", async () => {
    const { token } = await account();
    await call("PUT", "/progress", { token, body: { baseRev: 0, state: progress() } });
    await call("PUT", "/progress", { token, body: { baseRev: 1, state: progress({ done: [1, 2] }) } });
    const stale = await call("PUT", "/progress", { token, body: { baseRev: 1, state: progress({ done: [5] }) } });
    expect(stale.status).toBe(409);
    const body = await stale.json();
    expect(body.rev).toBe(2);
    expect(body.state.done).toEqual([1, 2]);
    const firstWriteRace = await call("PUT", "/progress", { token, body: { baseRev: 0, state: progress() } });
    expect(firstWriteRace.status).toBe(409);
  });

  it("isolates accounts", async () => {
    const a = await account();
    const b = await account();
    await call("PUT", "/progress", { token: a.token, body: { baseRev: 0, state: progress({ done: [42] }) } });
    expect((await (await call("GET", "/progress", { token: b.token })).json()).state).toBeNull();
  });
});

describe("device pairing", () => {
  it("links a second device to the same progress with a single-use code", async () => {
    const a = await account();
    await call("PUT", "/progress", { token: a.token, body: { baseRev: 0, state: progress({ done: [7] }) } });
    const { code, expiresAt } = await (await call("POST", "/pairing", { token: a.token })).json();
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(expiresAt).toBeGreaterThan(Date.now());
    const claim = await call("POST", "/pairing/claim", { body: { code: code.toLowerCase().replace("-", " ") } });
    expect(claim.status).toBe(201);
    const b = await claim.json();
    expect(b.userId).toBe(a.userId);
    expect(b.token).not.toBe(a.token);
    expect((await (await call("GET", "/progress", { token: b.token })).json()).state.done).toEqual([7]);
    expect((await call("POST", "/pairing/claim", { body: { code } })).status).toBe(404);
  });

  it("rejects expired codes", async () => {
    const a = await account();
    const { code } = await (await call("POST", "/pairing", { token: a.token })).json();
    env.DB.raw.exec("UPDATE pairing_codes SET expires_at = 0");
    expect((await call("POST", "/pairing/claim", { body: { code } })).status).toBe(404);
  });

  it("rejects malformed codes without touching the database", async () => {
    expect((await call("POST", "/pairing/claim", { body: { code: "ILOU-0000" } })).status).toBe(400);
  });
});

describe("learning analytics", () => {
  const event = (overrides = {}) => ({ challengeId: 3, option: 0, correct: true, mode: "practice", confidence: "Alta", review: false, at: 1, ...overrides });

  it("aggregates answers without storing who answered", async () => {
    const { token } = await account();
    const res = await call("POST", "/events", {
      token,
      body: { events: [event(), event({ correct: false, option: 2 }), event({ correct: false, option: 2, confidence: "" }), event({ challengeId: 999 })] },
    });
    expect(await res.json()).toEqual({ accepted: 3, dropped: 1 });
    const stats = await (await call("GET", "/admin/stats", { token: "admin-secret-token" })).json();
    const c3 = stats.challenges.find((c) => c.challengeId === 3);
    expect(c3).toMatchObject({ attempts: 3, correct: 1, options: [1, 0, 2, 0] });
    expect(c3.byConfidence.Alta).toEqual({ attempts: 2, correct: 1 });
    expect(c3.byConfidence["Sin indicar"]).toEqual({ attempts: 1, correct: 0 });
    expect(stats.totals.users).toBe(1);
    const columns = env.DB.raw.prepare("PRAGMA table_info(challenge_stats)").all().map((c) => c.name);
    expect(columns).not.toContain("user_id");
  });

  it("caps events per account per day", async () => {
    const { token } = await account();
    const batch = { events: Array.from({ length: 100 }, () => event()) };
    for (let i = 0; i < 6; i++) await call("POST", "/events", { token, body: batch });
    expect(await (await call("POST", "/events", { token, body: batch })).json()).toEqual({ accepted: 0, dropped: 100 });
  });

  it("protects the statistics with the admin token", async () => {
    expect((await call("GET", "/admin/stats")).status).toBe(401);
    expect((await call("GET", "/admin/stats", { token: "admin-secret-tokeN" })).status).toBe(401);
    delete env.ADMIN_TOKEN;
    expect((await call("GET", "/admin/stats", { token: "anything" })).status).toBe(404);
  });
});

describe("push subscriptions", () => {
  const subscribe = (token, overrides = {}) =>
    call("PUT", "/push/subscription", {
      token,
      body: { subscription: { endpoint: FCM, keys: { p256dh: P256DH, auth: AUTH } }, reminderTime: "19:00", timezone: "America/Santo_Domingo", ...overrides },
    });

  it("exposes the public VAPID key", async () => {
    expect(await (await call("GET", "/push/public-key")).json()).toEqual({ publicKey: env.VAPID_PUBLIC_KEY });
  });

  it("stores and updates a subscription", async () => {
    const { token } = await account();
    expect((await subscribe(token)).status).toBe(200);
    expect((await subscribe(token, { reminderTime: "07:15" })).status).toBe(200);
    const rows = env.DB.raw.prepare("SELECT reminder_time FROM push_subscriptions").all();
    expect(rows).toEqual([{ reminder_time: "07:15" }]);
    expect((await call("DELETE", "/push/subscription", { token, body: { endpoint: FCM } })).status).toBe(204);
    expect(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM push_subscriptions").get().n).toBe(0);
  });

  it.each([
    ["a non push-service endpoint", { subscription: { endpoint: "https://attacker.example/hook", keys: { p256dh: P256DH, auth: AUTH } } }],
    ["an internal address", { subscription: { endpoint: "https://fcm.googleapis.com:8443/x", keys: { p256dh: P256DH, auth: AUTH } } }],
    ["plain http", { subscription: { endpoint: "http://fcm.googleapis.com/x", keys: { p256dh: P256DH, auth: AUTH } } }],
    ["a short key", { subscription: { endpoint: FCM, keys: { p256dh: "AAAA", auth: AUTH } } }],
    ["a bad time", { reminderTime: "7pm" }],
    ["an unknown timezone", { timezone: "Mars/Olympus" }],
  ])("rejects %s", async (_name, overrides) => {
    const { token } = await account();
    expect((await subscribe(token, overrides)).status).toBe(400);
  });

  it("reports push as unavailable when VAPID is not configured", async () => {
    delete env.VAPID_PRIVATE_KEY;
    expect((await call("GET", "/push/public-key")).status).toBe(503);
  });
});
