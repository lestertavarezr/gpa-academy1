import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { answer, trackProblems } from "./helpers.js";

const token = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("neuroscan-device")).token);

test("learns, syncs to the cloud and reports analytics", async ({ page, request }) => {
  const problems = trackProblems(page);
  await page.goto("/");
  await page.locator("summary", { hasText: "Guardar y transferir progreso" }).click();
  await expect(page.locator("#ns-sync-status")).toHaveText(/sincronizado/);
  const ch = await answer(page);
  await expect(page.locator(".feedback strong")).toHaveText("Respuesta correcta");

  await expect
    .poll(async () => (await (await request.get("/api/v1/progress", { headers: { Authorization: `Bearer ${await token(page)}` } })).json()).state?.done ?? [])
    .toContain(ch.id);
  await expect
    .poll(async () => {
      const stats = await (await request.get("/api/v1/admin/stats", { headers: { Authorization: "Bearer e2e-admin-token" } })).json();
      return stats.challenges.find((c) => c.challengeId === ch.id)?.attempts ?? 0;
    })
    .toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test("links a second device with a pairing code", async ({ page, browser }) => {
  await page.goto("/");
  const ch = await answer(page);
  await page.locator("summary", { hasText: "Guardar y transferir progreso" }).click();
  await expect(page.locator("#ns-sync-status")).toHaveText(/sincronizado/);
  await page.locator("#ns-pair-create").click();
  const message = page.locator("#ns-pair-message");
  await expect(message).toHaveText(/Código para tu otro dispositivo/);
  const code = /([0-9A-Z]{4}-[0-9A-Z]{4})/.exec(await message.textContent())[1];

  const other = await browser.newContext();
  const phone = await other.newPage();
  await phone.goto("/");
  await phone.locator("summary", { hasText: "Guardar y transferir progreso" }).click();
  await phone.locator("#ns-pair-input").fill(code);
  await phone.locator("#ns-pair-claim").click();
  await expect(phone.locator("#ns-pair-message")).toHaveText(/Dispositivo vinculado/);
  const done = await phone.evaluate(() => JSON.parse(localStorage.getItem("neuroscan-progress-v1")).done);
  expect(done).toContain(ch.id);
  await phone.locator("#ns-pair-input").fill(code);
  await phone.locator("#ns-pair-claim").click();
  await expect(phone.locator("#ns-pair-message")).toHaveText(/inválido o vencido/);
  await other.close();
});

test("works offline once the service worker is installed", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready) && navigator.serviceWorker.controller !== null, null, { timeout: 20_000 }).catch(async () => {
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  });
  const title = await page.locator("#ns-main h2").textContent();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#ns-main h2")).toHaveText(title);
  const images = page.locator("#ns-main .challenge-images img");
  if (await images.count()) await expect.poll(() => images.first().evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await context.setOffline(false);
});

test("explains when notification permission is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Notification, "permission", { get: () => "denied" });
  });
  await page.goto("/");
  await page.locator("summary", { hasText: "Recordatorio opcional" }).click();
  await page.locator("#ns-reminder-toggle").click();
  await expect(page.locator("#ns-reminder-status")).toHaveText(/No se concedió permiso/);
  await expect(page.locator("#ns-reminder-toggle")).toHaveText("Activar recordatorio");
});

test("falls back to an in-app reminder when push cannot be subscribed", async ({ page }) => {
  // Headless Chromium has no push service; force a granted permission so the subscribe path runs.
  await page.addInitScript(() => {
    Object.defineProperty(Notification, "permission", { get: () => "granted" });
  });
  await page.goto("/");
  await page.locator("summary", { hasText: "Recordatorio opcional" }).click();
  await page.locator("#ns-reminder-toggle").click();
  await expect(page.locator("#ns-reminder-toggle")).toHaveText("Desactivar recordatorio", { timeout: 15_000 });
  await expect(page.locator("#ns-reminder-status")).toHaveText(/aunque cierres la app|mientras esta app permanezca abierta/);
  await page.locator("#ns-reminder-toggle").click();
  await expect(page.locator("#ns-reminder-status")).toHaveText("Recordatorio desactivado.");
});

test("admin dashboard requires the token and lists statistics", async ({ page }) => {
  await page.goto("/admin.html");
  await page.locator("#token").fill("wrong");
  await page.locator("button[type=submit]").click();
  await expect(page.locator("#status")).toHaveText("Token incorrecto.");
  await page.locator("#token").fill("e2e-admin-token");
  await page.locator("#min").fill("0");
  await page.locator("button[type=submit]").click();
  await expect(page.locator("#status")).toHaveText(/Actualizado/);
  await expect(page.locator("#table tbody tr").first()).toBeVisible();
});

test("has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ns-main h2")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
