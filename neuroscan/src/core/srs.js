import { DAY_MS } from "./dates.js";

export const LADDER = [1, 3, 7, 14, 30];
const CONFIDENCE_FACTOR = { Alta: 1.25, Baja: 0.7 };

export function emptyCard() {
  return { streak: 0, interval: 0, dueAt: 0, reviews: 0 };
}

// Leitner-style ladder. A correct answer given before the card is due does not advance
// the schedule, so repeating a card early cannot be used to farm mastery.
export function reviewCard(previous, { correct, confidence, now }) {
  const prev = previous || emptyCard();
  const wasDue = !prev.reviews || Number(prev.dueAt) <= now;
  let streak = Number(prev.streak) || 0;
  let interval = Number(prev.interval) || 0;
  let dueAt = Number(prev.dueAt) || 0;
  if (!correct) {
    streak = 0;
    interval = 1;
    dueAt = now + DAY_MS;
  } else if (wasDue) {
    streak += 1;
    const factor = CONFIDENCE_FACTOR[confidence] ?? 1;
    interval = Math.max(1, Math.round(LADDER[Math.min(streak - 1, LADDER.length - 1)] * factor));
    dueAt = now + interval * DAY_MS;
  }
  return { streak, interval, dueAt, reviews: (Number(prev.reviews) || 0) + 1 };
}

export function isMastered(card) {
  return !!card && Number(card.streak) >= 3 && Number(card.interval) >= 7;
}

export function isDue(card, now) {
  return !!card && Number(card.dueAt) > 0 && Number(card.dueAt) <= now;
}

export function dueIds(srs, challenges, now) {
  return challenges
    .filter((c) => isDue(srs[c.id], now))
    .sort((a, b) => Number(srs[a.id].dueAt) - Number(srs[b.id].dueAt))
    .map((c) => c.id);
}

export function nextDueAt(srs, now) {
  const upcoming = Object.values(srs).map((card) => Number(card?.dueAt) || 0).filter((t) => t > now);
  return upcoming.length ? Math.min(...upcoming) : null;
}
