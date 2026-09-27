import authored from "../../content/challenges.json" with { type: "json" };
import { buildChallenges } from "../../src/core/content.js";

export const challenges = buildChallenges(authored);

export async function currentChallenge(page) {
  const title = await page.locator("#ns-main h2").textContent();
  return challenges.find((c) => c.title === title);
}

export async function answer(page, { correct = true } = {}) {
  const ch = await currentChallenge(page);
  const choice = correct ? ch.answer : (ch.answer + 1) % 4;
  await page.locator(`[data-choice="${choice}"]`).click();
  await page.locator("#ns-submit").click();
  return ch;
}

export function trackProblems(page) {
  const problems = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || /Content Security Policy|Refused to/i.test(msg.text())) problems.push(msg.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}
