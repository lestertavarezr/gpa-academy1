import { beforeEach, describe, expect, it } from "vitest";
import { dueCount, dueReminderDay, localClock, reminderPayload, sendDueReminders } from "../../worker/src/reminders.js";
import { createD1 } from "./d1-shim.js";

// 23:30 UTC on Jan 10 is 19:30 in Santo Domingo (UTC-4) and already Jan 11 in Madrid (UTC+1).
const NOW = new Date(Date.UTC(2026, 0, 10, 23, 30));
const row = (overrides = {}) => ({ reminder_time: "19:00", timezone: "America/Santo_Domingo", last_sent_day: null, last_active_day: null, ...overrides });

describe("local time rules", () => {
  it("computes the learner's local day and minute", () => {
    expect(localClock(NOW, "America/Santo_Domingo")).toEqual({ day: "2026-01-10", minutes: 19 * 60 + 30 });
    expect(localClock(NOW, "Europe/Madrid")).toEqual({ day: "2026-01-11", minutes: 30 });
  });

  it("is due after the local reminder time, once per day", () => {
    expect(dueReminderDay(row(), NOW)).toBe("2026-01-10");
    expect(dueReminderDay(row({ reminder_time: "20:00" }), NOW)).toBeNull();
    expect(dueReminderDay(row({ last_sent_day: "2026-01-10" }), NOW)).toBeNull();
  });

  it("skips learners who already studied today", () => {
    expect(dueReminderDay(row({ last_active_day: "2026-01-10" }), NOW)).toBeNull();
    expect(dueReminderDay(row({ last_active_day: "2026-01-09" }), NOW)).toBe("2026-01-10");
  });

  it("ignores rows with an invalid timezone", () => {
    expect(dueReminderDay(row({ timezone: "Nowhere/Zone" }), NOW)).toBeNull();
  });

  it("counts overdue reviews from the stored progress", () => {
    const state = JSON.stringify({ srs: { 1: { dueAt: 1 }, 2: { dueAt: NOW.getTime() + 1 }, 3: { dueAt: 0 } } });
    expect(dueCount(state, NOW.getTime())).toBe(1);
    expect(dueCount("{broken", NOW.getTime())).toBe(0);
    expect(reminderPayload(1).body).toBe("Tienes 1 caso listo para repasar.");
    expect(reminderPayload(0).body).toMatch(/sesión corta/);
  });
});

describe("sendDueReminders", () => {
  let env;
  const insert = (endpoint, overrides = {}) => {
    const r = { user: "u1", time: "19:00", tz: "America/Santo_Domingo", failures: 0, ...overrides };
    env.DB.raw.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, 0)").run(r.user);
    env.DB.raw
      .prepare("INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth, reminder_time, timezone, failures, created_at) VALUES (?, ?, 'k', 'a', ?, ?, ?, 0)")
      .run(endpoint, r.user, r.time, r.tz, r.failures);
  };
  const subs = () => env.DB.raw.prepare("SELECT endpoint, last_sent_day, failures FROM push_subscriptions ORDER BY endpoint").all().map((r) => ({ ...r }));

  beforeEach(() => {
    env = { DB: createD1(), VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv" };
  });

  it("sends due reminders, prunes dead subscriptions and counts failures", async () => {
    insert("https://push/ok");
    insert("https://push/gone");
    insert("https://push/flaky");
    insert("https://push/later", { time: "21:00" });
    const sent = [];
    const status = { "https://push/ok": 201, "https://push/gone": 410, "https://push/flaky": 500 };
    const result = await sendDueReminders(env, {
      now: NOW,
      send: async (sub, payload) => {
        sent.push([sub.endpoint, payload.title]);
        return { ok: status[sub.endpoint] < 300, status: status[sub.endpoint] };
      },
    });
    expect(result).toEqual({ sent: 1, removed: 1 });
    expect(sent.map(([endpoint]) => endpoint).sort()).toEqual(["https://push/flaky", "https://push/gone", "https://push/ok"]);
    expect(subs()).toEqual([
      { endpoint: "https://push/flaky", last_sent_day: null, failures: 1 },
      { endpoint: "https://push/later", last_sent_day: null, failures: 0 },
      { endpoint: "https://push/ok", last_sent_day: "2026-01-10", failures: 0 },
    ]);
    const again = await sendDueReminders(env, { now: NOW, send: async () => ({ ok: true, status: 201 }) });
    expect(again).toEqual({ sent: 1, removed: 0 });
  });

  it("drops a subscription after repeated failures", async () => {
    insert("https://push/bad", { failures: 4 });
    await sendDueReminders(env, { now: NOW, send: async () => ({ ok: false, status: 500 }) });
    expect(subs()).toEqual([]);
  });

  it("respects the per-run cap", async () => {
    for (let i = 0; i < 5; i++) insert(`https://push/${i}`);
    env.MAX_PUSH_PER_RUN = "2";
    const result = await sendDueReminders(env, { now: NOW, send: async () => ({ ok: true, status: 201 }) });
    expect(result.sent).toBe(2);
  });

  it("does nothing when push is not configured", async () => {
    delete env.VAPID_PRIVATE_KEY;
    expect((await sendDueReminders(env, { now: NOW })).sent).toBe(0);
  });
});
