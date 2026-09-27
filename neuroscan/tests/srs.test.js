import { describe, expect, it } from "vitest";
import { DAY_MS } from "../src/core/dates.js";
import { dueIds, isDue, isMastered, nextDueAt, reviewCard } from "../src/core/srs.js";

const NOW = Date.UTC(2026, 0, 10, 12);

describe("reviewCard", () => {
  it("climbs the 1-3-7-14-30 day ladder on consecutive correct reviews", () => {
    let card;
    let now = NOW;
    const intervals = [];
    for (let i = 0; i < 6; i++) {
      card = reviewCard(card, { correct: true, now });
      intervals.push(card.interval);
      now = card.dueAt;
    }
    expect(intervals).toEqual([1, 3, 7, 14, 30, 30]);
    expect(card.reviews).toBe(6);
  });

  it("resets to one day after a mistake", () => {
    const card = reviewCard({ streak: 4, interval: 14, dueAt: NOW - 1, reviews: 4 }, { correct: false, now: NOW });
    expect(card).toEqual({ streak: 0, interval: 1, dueAt: NOW + DAY_MS, reviews: 5 });
  });

  it("scales the interval by self-reported confidence", () => {
    const due = { streak: 2, interval: 3, dueAt: NOW, reviews: 2 };
    expect(reviewCard(due, { correct: true, confidence: "Alta", now: NOW }).interval).toBe(9);
    expect(reviewCard(due, { correct: true, confidence: "Baja", now: NOW }).interval).toBe(5);
    expect(reviewCard(due, { correct: true, confidence: "Media", now: NOW }).interval).toBe(7);
  });

  it("does not advance the schedule when answered before it is due", () => {
    const early = { streak: 1, interval: 1, dueAt: NOW + DAY_MS, reviews: 1 };
    expect(reviewCard(early, { correct: true, now: NOW })).toEqual({ ...early, reviews: 2 });
  });
});

describe("scheduling helpers", () => {
  const srs = {
    1: { streak: 3, interval: 7, dueAt: NOW - 10, reviews: 3 },
    2: { streak: 1, interval: 1, dueAt: NOW - 20, reviews: 1 },
    3: { streak: 1, interval: 3, dueAt: NOW + 5000, reviews: 1 },
  };
  const challenges = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  it("lists due cards oldest first", () => expect(dueIds(srs, challenges, NOW)).toEqual([2, 1]));
  it("finds the next upcoming review", () => expect(nextDueAt(srs, NOW)).toBe(NOW + 5000));
  it("returns null when nothing is scheduled", () => expect(nextDueAt({}, NOW)).toBeNull());
  it("treats unscheduled cards as not due", () => expect(isDue({ streak: 0, interval: 0, dueAt: 0, reviews: 0 }, NOW)).toBe(false));
  it("requires a 3-streak and a week interval for mastery", () => {
    expect(isMastered(srs[1])).toBe(true);
    expect(isMastered({ streak: 3, interval: 5 })).toBe(false);
    expect(isMastered(undefined)).toBe(false);
  });
});
