import path from "node:path";
import { expect, test } from "@playwright/test";
import { answer, trackProblems } from "./helpers.js";

const FILE = `file://${path.resolve("dist/standalone/neuroscan-app.html")}`;

test("the single-file build runs from disk under its hash-based CSP", async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto(FILE);
  await expect(page.locator("#ns-main h2")).toBeVisible();
  const ch = await answer(page);
  await expect(page.locator(".feedback strong")).toHaveText("Respuesta correcta");
  await page.reload();
  await expect(page.locator("#ns-progress")).toHaveText("1 / 98");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("neuroscan-progress-v1")));
  expect(saved.done).toEqual([ch.id]);
  await expect(page.locator("#ns-cloud")).toBeHidden();
  expect(problems).toEqual([]);
});

test("images are embedded and the zoom dialog works", async ({ page }) => {
  await page.goto(FILE);
  await page.locator("#ns-modules [data-mod='0']").click();
  const firstImage = page.locator("#ns-main .challenge-images img").first();
  await expect.poll(() => firstImage.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.locator("#ns-main .image-expand").first().click();
  await expect(page.locator("#ns-zoom")).toBeVisible();
  await expect(page.locator("#ns-zoom-caption")).not.toBeEmpty();
  await page.keyboard.press("Escape");
  await expect(page.locator("#ns-zoom")).toBeHidden();
});

test("backups export and import", async ({ page }) => {
  await page.goto(FILE);
  const ch = await answer(page);
  await page.locator("summary", { hasText: "Guardar y transferir progreso" }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#ns-export").click()]);
  const file = await download.path();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#ns-progress")).toHaveText("0 / 98");
  await page.locator("summary", { hasText: "Guardar y transferir progreso" }).click();
  await page.locator("#ns-import-file").setInputFiles(file);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("neuroscan-progress-v1") || "{}").done)).toEqual([ch.id]);
});
