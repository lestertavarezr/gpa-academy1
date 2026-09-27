import { expect, test } from "@playwright/test";
import { answer } from "./helpers.js";

test("is usable on a phone without horizontal scrolling", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ns-main h2")).toBeVisible();
  await expect(page.locator("#ns-mobile-module")).toBeVisible();
  await expect(page.locator("#ns-modules")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await answer(page);
  await expect(page.locator(".feedback")).toBeVisible();
  await page.locator("#ns-mobile-module").selectOption("6");
  await expect(page.locator(".badge").first()).toHaveText("Módulo 07");
});
