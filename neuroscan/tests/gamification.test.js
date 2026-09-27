import { describe, expect, it } from "vitest";
import { awardAnswer, streakMultiplier, studyStreak } from "../src/core/gamification.js";
import { defaultState } from "../src/core/state.js";

const day = (d) => new Date(2026, 0, d, 10);
const keys = (...days) => days.map((d) => `2026-01-${String(d).padStart(2, "0")}`);

describe("streaks", () => {
  it("counts consecutive days ending today", () => {
    expect(studyStreak(keys(7, 8, 9, 10), day(10))).toBe(4);
    expect(studyStreak(keys(7, 9, 10), day(10))).toBe(2);
    expect(studyStreak(keys(7, 8, 9), day(10))).toBe(0);
  });

  it("maps streak length to an XP multiplier", () => {
    expect([0, 3, 7, 14, 40].map(streakMultiplier)).toEqual([1, 1.25, 1.5, 2, 2]);
  });
});

describe("awardAnswer", () => {
  it("rewards practice even when wrong", () => {
    const state = defaultState();
    expect(awardAnswer(state, { correct: false, now: day(10), sessionSize: 5 })).toBe(10);
    expect(state.activityDays).toEqual(keys(10));
  });

  it("grants the streak milestone once", () => {
    const state = { ...defaultState(), activityDays: keys(8, 9) };
    expect(awardAnswer(state, { correct: true, now: day(10), sessionSize: 5 })).toBe(Math.round(15 * 1.25) + 25);
    expect(awardAnswer(state, { correct: true, now: day(10), sessionSize: 5 })).toBe(Math.round(15 * 1.25));
    expect(state.streakBonuses).toEqual([3]);
  });

  it("pays the daily bonus when a full session of five is completed, once per day", () => {
    const state = { ...defaultState(), sessionQueue: [1, 2, 3, 4, 5], sessionDone: [1, 2, 3, 4, 5] };
    expect(awardAnswer(state, { correct: true, now: day(10), sessionSize: 5 })).toBe(15 + 50);
    expect(state.dailyBonusClaimed).toBe(true);
    expect(awardAnswer(state, { correct: true, now: day(10), sessionSize: 5 })).toBe(15);
    expect(state.xpTotal).toBe(80);
  });
});
