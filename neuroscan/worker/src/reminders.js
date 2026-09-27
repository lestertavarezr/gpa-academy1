import { sendWebPush } from "./push/webpush.js";

const MAX_FAILURES = 5;
const SEND_CONCURRENCY = 10;

export function localClock(now, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function dueCount(stateText, now) {
  try {
    const srs = JSON.parse(stateText || "{}").srs || {};
    return Object.values(srs).filter((card) => Number(card?.dueAt) > 0 && Number(card.dueAt) <= now).length;
  } catch {
    return 0;
  }
}

// Returns the local day to record if a reminder should go out now, else null. Due means the
// local reminder time has passed, nothing was sent today, and the learner has not studied today.
export function dueReminderDay(row, now) {
  let clock;
  try {
    clock = localClock(now, row.timezone);
  } catch {
    return null;
  }
  const [h, m] = row.reminder_time.split(":").map(Number);
  return clock.minutes >= h * 60 + m && row.last_sent_day !== clock.day && row.last_active_day !== clock.day ? clock.day : null;
}

export function reminderPayload(due) {
  return {
    title: "NEURO//SCAN · Repaso",
    body: due ? `Tienes ${due} ${due === 1 ? "caso listo" : "casos listos"} para repasar.` : "Te espera una sesión corta de 5 casos.",
  };
}

// Invoked by the cron trigger. Sends are capped per run to stay inside the Workers
// subrequest limit; anything left over is picked up by the next run.
export async function sendDueReminders(env, { now = new Date(), send = sendWebPush } = {}) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return { sent: 0, removed: 0, skipped: "push no configurado" };
  const limit = Number(env.MAX_PUSH_PER_RUN) || 25;
  const { results } = await env.DB.prepare(
    `SELECT s.endpoint, s.p256dh, s.auth, s.reminder_time, s.timezone, s.last_sent_day, s.failures, p.state, p.last_active_day
     FROM push_subscriptions s LEFT JOIN progress p ON p.user_id = s.user_id
     ORDER BY s.last_sent_day IS NOT NULL, s.last_sent_day LIMIT 5000`,
  ).all();
  const due = [];
  for (const row of results) {
    const day = dueReminderDay(row, now);
    if (day) due.push({ row, day });
    if (due.length >= limit) break;
  }
  const updates = [];
  let sent = 0;
  let removed = 0;
  for (let i = 0; i < due.length; i += SEND_CONCURRENCY) {
    await Promise.all(
      due.slice(i, i + SEND_CONCURRENCY).map(async ({ row, day }) => {
        let result;
        try {
          result = await send(row, reminderPayload(dueCount(row.state, now.getTime())), env);
        } catch {
          result = { ok: false, status: 0 };
        }
        if (result.ok) {
          sent++;
          updates.push(env.DB.prepare("UPDATE push_subscriptions SET last_sent_day = ?, failures = 0 WHERE endpoint = ?").bind(day, row.endpoint));
        } else if (result.status === 404 || result.status === 410 || row.failures + 1 >= MAX_FAILURES) {
          removed++;
          updates.push(env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(row.endpoint));
        } else {
          updates.push(env.DB.prepare("UPDATE push_subscriptions SET failures = failures + 1 WHERE endpoint = ?").bind(row.endpoint));
        }
      }),
    );
  }
  if (updates.length) await env.DB.batch(updates);
  return { sent, removed };
}
