// One-off: renders src/icons/icon.svg to the PNG sizes the web manifest needs.
import fs from "node:fs";
import { chromium } from "@playwright/test";

const svg = fs.readFileSync(new URL("../src/icons/icon.svg", import.meta.url), "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: new URL(`../src/icons/icon-${size}.png`, import.meta.url).pathname });
}
await browser.close();
