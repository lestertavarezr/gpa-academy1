export function calculateScore(isCorrect, timeRemaining, totalTime, streak) {
  if (!isCorrect) return 0;
  const base = 500;
  const speedBonus = Math.floor((timeRemaining / totalTime) * 500);
  const streakBonus = streak >= 5 ? 300 : streak >= 3 ? 200 : streak >= 2 ? 100 : 0;
  return base + speedBonus + streakBonus;
}

export function getStreakMessage(streak) {
  if (streak >= 5) return { text: "🔥 EN LLAMAS", bonus: 500 };
  if (streak >= 3) return { text: "🔥 Racha x" + streak, bonus: 200 };
  if (streak >= 2) return { text: "🔥 Racha x" + streak, bonus: 100 };
  return null;
}
