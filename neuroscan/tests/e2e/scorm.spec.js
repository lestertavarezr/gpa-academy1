import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { answer, trackProblems } from "./helpers.js";

// Mimics Moodle's SCORM player: the SCORM 1.2 API lives on the player page and the package
// runs in an iframe from the same origin. The LMS record survives reloads like Moodle's DB.
const HOST = `<!doctype html><html lang="es"><body style="margin:0">
<script type="module">
import { createFakeScorm12 } from "/fake-scorm12.js";
const params = new URLSearchParams(location.search);
const key = "lms-record-" + (params.get("learner") || "ana");
const record = JSON.parse(localStorage.getItem(key) || "{}");
window.API = createFakeScorm12({ record, mode: params.get("mode") || "normal", onCommit: (data) => localStorage.setItem(key, JSON.stringify(data)) });
const frame = document.createElement("iframe");
frame.id = "scorm_object";
frame.src = "/scorm/index.html";
frame.style.cssText = "width:100%;height:1000px;border:0";
document.body.append(frame);
</script></body></html>`;

let server;
let base;

test.beforeAll(async () => {
  const files = {
    "/host.html": ["text/html", () => HOST],
    "/fake-scorm12.js": ["text/javascript", () => fs.readFileSync(path.resolve("tests/fake-scorm12.js"))],
    "/scorm/index.html": ["text/html", () => fs.readFileSync(path.resolve("dist/scorm/index.html"))],
  };
  server = http.createServer((req, res) => {
    const entry = files[new URL(req.url, "http://x").pathname];
    if (!entry) return res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": entry[0] }).end(entry[1]());
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(() => server?.close());

const record = (page, learner = "ana") => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), `lms-record-${learner}`);

test("reports progress and grade to the LMS and resumes it on the next launch", async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto(`${base}/host.html`);
  const app = page.frameLocator("#scorm_object");
  await expect(app.locator("#ns-main h2")).toBeVisible();
  const frame = page.frame({ url: /scorm\/index\.html/ });
  const ch = await answer(frame);
  await expect(app.locator(".feedback strong")).toHaveText("Respuesta correcta");

  await expect.poll(async () => (await record(page))["cmi.core.score.raw"]).toBe("1");
  const saved = await record(page);
  expect(saved["cmi.core.lesson_status"]).toBe("incomplete");
  expect(saved["cmi.suspend_data"].length).toBeLessThanOrEqual(4096);

  // Leaving the activity finishes the SCORM session (session time + suspend).
  await page.goto("about:blank");
  await page.goto(`${base}/host.html`);
  await expect.poll(async () => (await record(page))["cmi.core.exit"]).toBe("suspend");
  expect((await record(page))["cmi.core.session_time"]).toMatch(/^\d{2,4}:\d{2}:\d{2}$/);
  await expect(app.locator("#ns-progress")).toHaveText("1 / 5");
  await expect(app.locator("#ns-main h2")).toHaveText(ch.title);
  await expect(app.locator(".feedback strong")).toHaveText("Respuesta correcta");
  await expect(app.locator("#ns-import")).toBeHidden();
  expect(problems).toEqual([]);
});

test("keeps each learner's progress separate on a shared computer", async ({ page }) => {
  await page.goto(`${base}/host.html?learner=luis`);
  await expect(page.frameLocator("#scorm_object").locator("#ns-main h2")).toBeVisible();
  await answer(page.frame({ url: /scorm\/index\.html/ }));
  await expect.poll(async () => (await record(page, "luis"))["cmi.suspend_data"] ?? "").not.toBe("");

  await page.goto(`${base}/host.html?learner=maria`);
  const app = page.frameLocator("#scorm_object");
  await expect(app.locator("#ns-progress")).toHaveText("0 / 5");
  await expect(app.locator("#ns-xp-total")).toHaveText("0");
});

test("tells the learner when Moodle opened the activity in review mode", async ({ page }) => {
  await page.goto(`${base}/host.html?learner=rev&mode=review`);
  const app = page.frameLocator("#scorm_object");
  await expect(app.locator("#ns-main h2")).toBeVisible();
  await answer(page.frame({ url: /scorm\/index\.html/ }));
  await expect(app.locator("#ns-storage-warning")).toBeVisible();
  await expect(app.locator("#ns-storage-warning")).toHaveText(/modo revisión/);
});
