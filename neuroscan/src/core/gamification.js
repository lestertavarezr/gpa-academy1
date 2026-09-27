import { todayKey } from "./dates.js";

export const DAILY_BONUS_XP = 50;
export const STREAK_MILESTONES = [[3, 25], [7, 50], [14, 100], [30, 250]];

export function studyStreak(activityDays, today = new Date()) {
  const days = new Set(activityDays);
  const cursor = new Date(today);
  let count = 0;
  while (days.has(todayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function streakMultiplier(streakDays) {
  return streakDays >= 14 ? 2 : streakDays >= 7 ? 1.5 : streakDays >= 3 ? 1.25 : 1;
}

// Mutates `state`: records today's activity and awards XP for one answer, streak milestones
// and the daily bonus. Wrong answers still earn XP to reward practice over guessing avoidance.
export function awardAnswer(state, { correct, now = new Date(), sessionSize }) {
  const day = todayKey(now);
  if (!state.activityDays.includes(day)) state.activityDays = [...state.activityDays, day].slice(-90);
  const streak = studyStreak(state.activityDays, now);
  let earned = Math.round((correct ? 15 : 10) * streakMultiplier(streak));
  for (const [days, reward] of STREAK_MILESTONES) {
    if (streak >= days && !state.streakBonuses.includes(days)) {
      state.streakBonuses = [...state.streakBonuses, days];
      earned += reward;
    }
  }
  const sessionComplete = state.sessionQueue.length === sessionSize && state.sessionDone.length === state.sessionQueue.length;
  if (sessionComplete && !(state.dailyBonusDay === day && state.dailyBonusClaimed)) {
    state.dailyBonusDay = day;
    state.dailyBonusClaimed = true;
    earned += DAILY_BONUS_XP;
  }
  state.xpTotal += earned;
  state.sessionXP += earned;
  return earned;
}
