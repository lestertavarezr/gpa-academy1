import challenges from "../../content/challenges.json";
import { isValidTime } from "../../src/core/dates.js";
import { sanitizeState } from "../../src/core/state.js";
import { base64UrlToBytes, randomToken, sha256Hex, timingSafeEqualText } from "./encoding.js";
import { HttpError, json, readJson } from "./http.js";
import { isAllowedPushEndpoint } from "./push/webpush.js";

const CHALLENGE_COUNT = challenges.length;
const DAY_MS = 86_400_000;
const PAIRING_TTL_MS = 10 * 60_000;
const MAX_EVENTS_PER_REQUEST = 100;
const MAX_EVENTS_PER_DAY = 600;
const MAX_SUBSCRIPTIONS_PER_USER = 10;
const MAX_PROGRESS_BYTES = 256 * 1024;
const LAST_SEEN_RESOLUTION_MS = 3_600_000;
// Crockford base32: no I, L, O, U, so codes survive being read aloud or retyped.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CONFIDENCE = ["", "Baja", "Media", "Alta"];

async function issueDevice(env, userId, now) {
  const token = randomToken();
  await env.DB.prepare("INSERT INTO devices (token_hash, user_id, created_at, last_seen_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256Hex(token), userId, now, now)
    .run();
  return token;
}

export async function authenticate(request, env, now = Date.now()) {
  const match = /^Bearer ([A-Za-z0-9_-]{20,200})$/.exec(request.headers.get("Authorization") || "");
  if (!match) throw new HttpError(401, "No autenticado");
  const tokenHash = await sha256Hex(match[1]);
  const row = await env.DB.prepare("SELECT user_id, last_seen_at FROM devices WHERE token_hash = ?").bind(tokenHash).first();
  if (!row) throw new HttpError(401, "No autenticado");
  if (now - row.last_seen_at > LAST_SEEN_RESOLUTION_MS) {
    await env.DB.prepare("UPDATE devices SET last_seen_at = ? WHERE token_hash = ?").bind(now, tokenHash).run();
  }
  return { userId: row.user_id, tokenHash };
}

export async function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN) throw new HttpError(404, "No encontrado");
  const token = /^Bearer (.+)$/.exec(request.headers.get("Authorization") || "")?.[1] || "";
  if (!(await timingSafeEqualText(token, env.ADMIN_TOKEN))) throw new HttpError(401, "No autenticado");
}

export async function createAccount(_request, env, { now }) {
  const userId = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO users (id, created_at) VALUES (?, ?)").bind(userId, now).run();
  const token = await issueDevice(env, userId, now);
  return json({ userId, token }, 201);
}

export async function deleteAccount(_request, env, { user }) {
  const id = user.userId;
  await env.DB.batch(
    ["push_subscriptions", "pairing_codes", "progress", "devices"].map((table) => env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(id)).concat(env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id)),
  );
  return json(null, 204);
}

export async function getProgress(_request, env, { user }) {
  const row = await env.DB.prepare("SELECT rev, state, updated_at FROM progress WHERE user_id = ?").bind(user.userId).first();
  if (!row) return json({ rev: 0, state: null });
  return json({ rev: row.rev, state: JSON.parse(row.state), updatedAt: row.updated_at });
}

export async function putProgress(request, env, { user, now }) {
  const body = await readJson(request, MAX_PROGRESS_BYTES + 1024);
  if (!Number.isInteger(body.baseRev) || body.baseRev < 0) throw new HttpError(400, "baseRev inválido");
  if (!body.state || typeof body.state !== "object") throw new HttpError(400, "state inválido");
  let state;
  try {
    state = sanitizeState(body.state, { challengeCount: CHALLENGE_COUNT });
  } catch {
    throw new HttpError(400, "state inválido");
  }
  const text = JSON.stringify(state);
  if (text.length > MAX_PROGRESS_BYTES) throw new HttpError(413, "Progreso demasiado grande");
  const lastActive = state.activityDays.at(-1) ?? null;
  const nextRev = body.baseRev + 1;
  // Compare-and-swap on `rev`: a stale writer gets 409 with the current snapshot to merge.
  const result =
    body.baseRev === 0
      ? await env.DB.prepare("INSERT INTO progress (user_id, rev, state, updated_at, last_active_day) VALUES (?, 1, ?, ?, ?) ON CONFLICT(user_id) DO NOTHING")
          .bind(user.userId, text, now, lastActive)
          .run()
      : await env.DB.prepare("UPDATE progress SET rev = ?, state = ?, updated_at = ?, last_active_day = ? WHERE user_id = ? AND rev = ?")
          .bind(nextRev, text, now, lastActive, user.userId, body.baseRev)
          .run();
  if (!result.meta.changes) {
    const current = await env.DB.prepare("SELECT rev, state FROM progress WHERE user_id = ?").bind(user.userId).first();
    throw new HttpError(409, "Conflicto de versión", { rev: current?.rev ?? 0, state: current ? JSON.parse(current.state) : null });
  }
  return json({ rev: nextRev });
}

function validEvent(e) {
  return (
    e &&
    Number.isInteger(e.challengeId) &&
    e.challengeId >= 1 &&
    e.challengeId <= CHALLENGE_COUNT &&
    Number.isInteger(e.option) &&
    e.option >= 0 &&
    e.option <= 3 &&
    typeof e.correct === "boolean" &&
    (e.mode === "practice" || e.mode === "exam") &&
    CONFIDENCE.includes(e.confidence ?? "")
  );
}

export async function postEvents(request, env, { user, now }) {
  const body = await readJson(request, 64 * 1024);
  if (!Array.isArray(body.events) || body.events.length > MAX_EVENTS_PER_REQUEST) throw new HttpError(400, "events inválido");
  const events = body.events.filter(validEvent);
  const day = new Date(now).toISOString().slice(0, 10);
  // Per-account daily cap so one client cannot skew the aggregate statistics.
  const quota = await env.DB.prepare(
    "UPDATE users SET events_count = CASE WHEN events_day = ? THEN events_count + ? ELSE ? END, events_day = ? WHERE id = ? RETURNING events_count",
  )
    .bind(day, events.length, events.length, day, user.userId)
    .first();
  const overflow = Math.max(0, (quota?.events_count ?? 0) - MAX_EVENTS_PER_DAY);
  const accepted = events.slice(0, Math.max(0, events.length - overflow));
  const stats = new Map();
  const picks = new Map();
  for (const e of accepted) {
    const key = `${e.challengeId}|${e.mode}|${e.confidence ?? ""}`;
    const s = stats.get(key) || { attempts: 0, correct: 0 };
    s.attempts += 1;
    s.correct += e.correct ? 1 : 0;
    stats.set(key, s);
    const pickKey = `${e.challengeId}|${e.option}`;
    picks.set(pickKey, (picks.get(pickKey) || 0) + 1);
  }
  const statements = [];
  for (const [key, s] of stats) {
    const [challengeId, mode, confidence] = key.split("|");
    statements.push(
      env.DB.prepare(
        "INSERT INTO challenge_stats (challenge_id, mode, confidence, attempts, correct) VALUES (?, ?, ?, ?, ?) ON CONFLICT(challenge_id, mode, confidence) DO UPDATE SET attempts = attempts + excluded.attempts, correct = correct + excluded.correct",
      ).bind(Number(challengeId), mode, confidence, s.attempts, s.correct),
    );
  }
  for (const [key, count] of picks) {
    const [challengeId, option] = key.split("|").map(Number);
    statements.push(
      env.DB.prepare(
        "INSERT INTO option_picks (challenge_id, option_index, picks) VALUES (?, ?, ?) ON CONFLICT(challenge_id, option_index) DO UPDATE SET picks = picks + excluded.picks",
      ).bind(challengeId, option, count),
    );
  }
  if (statements.length) await env.DB.batch(statements);
  return json({ accepted: accepted.length, dropped: body.events.length - accepted.length }, 202);
}

function newPairingCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => CODE_ALPHABET[b & 31]).join("");
}

export async function createPairing(_request, env, { user, now }) {
  const code = newPairingCode();
  const expiresAt = now + PAIRING_TTL_MS;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM pairing_codes WHERE user_id = ? OR expires_at <= ?").bind(user.userId, now),
    env.DB.prepare("INSERT INTO pairing_codes (code_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256Hex(code), user.userId, expiresAt),
  ]);
  return json({ code: `${code.slice(0, 4)}-${code.slice(4)}`, expiresAt }, 201);
}

export async function claimPairing(request, env, { now }) {
  const body = await readJson(request, 1024);
  const code = String(body.code || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (code.length !== 8 || [...code].some((c) => !CODE_ALPHABET.includes(c))) throw new HttpError(400, "Código inválido");
  // DELETE … RETURNING makes the code single-use even under concurrent claims.
  const row = await env.DB.prepare("DELETE FROM pairing_codes WHERE code_hash = ? AND expires_at > ? RETURNING user_id").bind(await sha256Hex(code), now).first();
  if (!row) throw new HttpError(404, "Código inválido o vencido");
  const token = await issueDevice(env, row.user_id, now);
  return json({ userId: row.user_id, token }, 201);
}

export function pushPublicKey(_request, env) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) throw new HttpError(503, "Push no configurado");
  return json({ publicKey: env.VAPID_PUBLIC_KEY });
}

function validTimezone(timezone) {
  if (typeof timezone !== "string" || timezone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export async function putSubscription(request, env, { user, now }) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) throw new HttpError(503, "Push no configurado");
  const body = await readJson(request, 4096);
  const { endpoint, keys } = body.subscription || {};
  if (typeof endpoint !== "string" || endpoint.length > 1024 || !isAllowedPushEndpoint(endpoint)) throw new HttpError(400, "endpoint no permitido");
  let p256dh;
  let auth;
  try {
    p256dh = base64UrlToBytes(keys?.p256dh);
    auth = base64UrlToBytes(keys?.auth);
  } catch {
    throw new HttpError(400, "claves inválidas");
  }
  if (p256dh.length !== 65 || p256dh[0] !== 4 || auth.length !== 16) throw new HttpError(400, "claves inválidas");
  if (!isValidTime(body.reminderTime)) throw new HttpError(400, "reminderTime inválido");
  if (!validTimezone(body.timezone)) throw new HttpError(400, "timezone inválido");
  const existing = await env.DB.prepare("SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id = ? AND endpoint <> ?").bind(user.userId, endpoint).first();
  if ((existing?.n ?? 0) >= MAX_SUBSCRIPTIONS_PER_USER) throw new HttpError(429, "Demasiados dispositivos con avisos");
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth, reminder_time, timezone, last_sent_day, failures, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 0, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
       reminder_time = excluded.reminder_time, timezone = excluded.timezone, failures = 0`,
  )
    .bind(endpoint, user.userId, keys.p256dh, keys.auth, body.reminderTime, body.timezone, now)
    .run();
  return json({ ok: true });
}

export async function deleteSubscription(request, env, { user }) {
  const body = await readJson(request, 2048);
  if (typeof body.endpoint !== "string") throw new HttpError(400, "endpoint inválido");
  await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?").bind(body.endpoint, user.userId).run();
  return json(null, 204);
}

export async function adminStats(_request, env, { now }) {
  const [stats, picks, users, active, subs] = await env.DB.batch([
    env.DB.prepare("SELECT challenge_id, mode, confidence, attempts, correct FROM challenge_stats"),
    env.DB.prepare("SELECT challenge_id, option_index, picks FROM option_picks"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM users"),
    env.DB.prepare("SELECT COUNT(DISTINCT user_id) AS n FROM devices WHERE last_seen_at > ?").bind(now - 7 * DAY_MS),
    env.DB.prepare("SELECT COUNT(*) AS n FROM push_subscriptions"),
  ]);
  const byChallenge = new Map();
  const entry = (id) => {
    if (!byChallenge.has(id)) byChallenge.set(id, { challengeId: id, attempts: 0, correct: 0, byMode: {}, byConfidence: {}, options: [0, 0, 0, 0] });
    return byChallenge.get(id);
  };
  for (const row of stats.results) {
    const e = entry(row.challenge_id);
    e.attempts += row.attempts;
    e.correct += row.correct;
    for (const [group, key] of [["byMode", row.mode], ["byConfidence", row.confidence || "Sin indicar"]]) {
      e[group][key] ??= { attempts: 0, correct: 0 };
      e[group][key].attempts += row.attempts;
      e[group][key].correct += row.correct;
    }
  }
  for (const row of picks.results) entry(row.challenge_id).options[row.option_index] += row.picks;
  return json({
    generatedAt: now,
    totals: { users: users.results[0].n, activeUsers7d: active.results[0].n, pushSubscriptions: subs.results[0].n },
    challenges: [...byChallenge.values()].sort((a, b) => a.challengeId - b.challengeId),
  });
}

export function health(_request, env) {
  return json({ ok: true, challenges: CHALLENGE_COUNT, push: !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) });
}
