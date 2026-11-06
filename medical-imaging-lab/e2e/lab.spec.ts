import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { sign } from "../worker/auth";
import AxeBuilder from "@axe-core/playwright";
const uid = "1.2.826.0.1.3680043.10.543.20261105.1";
test("private DICOMweb is denied without an enrolled session", async ({
  request,
}) => {
  const response = await request.get(
    "/dicomweb/studies?StudyInstanceUID=" + uid,
  );
  expect(response.status()).toBe(401);
  const arbitrary = await request.get("/dicomweb/studies");
  expect(arbitrary.status()).toBe(401);
});
test("demo session cannot list PACS, open another UID or use admin API", async ({
  request,
}) => {
  const login = await request.post("/api/lab/auth/demo", {
    data: { key: "local-demo-access-key" },
  });
  expect(login.ok()).toBeTruthy();
  expect((await request.get("/dicomweb/studies")).status()).toBe(403);
  expect((await request.get("/dicomweb/studies/1.2.3/metadata")).status()).toBe(
    404,
  );
  expect((await request.get("/api/lab/admin/cases")).status()).toBe(403);
});
test("LMS exchange verifies audience and grants only signed case IDs", async ({
  request,
}) => {
  const secret = readFileSync(
    new URL("../.dev.vars", import.meta.url),
    "utf8",
  ).match(/^LMS_SHARED_SECRET=(.*)$/m)?.[1];
  expect(secret).toBeTruthy();
  const base = {
    sub: "e2e-lms-student",
    iss: "gpa-academy-os",
    aud: "gpa-imaging-lab",
    exp: Math.floor(Date.now() / 1000) + 300,
    caseIds: ["GPA-NEURO-001"],
  };
  const invalid = await sign({ ...base, aud: "different-audience" }, secret!);
  expect(
    (
      await request.post("/api/lab/auth/exchange", {
        headers: { Authorization: "Bearer " + invalid },
      })
    ).status(),
  ).toBe(403);
  const valid = await sign(base, secret!);
  expect(
    (
      await request.post("/api/lab/auth/exchange", {
        headers: { Authorization: "Bearer " + valid },
      })
    ).status(),
  ).toBe(200);
  expect((await request.get("/api/lab/cases")).ok()).toBeTruthy();
});
test("demo learner opens OHIF study, answers and persists progress", async ({
  page,
}) => {
  const frames: number[] = [];
  page.on("response", (response) => {
    if (
      response.url().includes("/dicomweb/") &&
      response.url().includes("/frames/1")
    )
      frames.push(response.status());
  });
  await page.goto("/lab/");
  await page.getByLabel("Clave de acceso local").fill("local-demo-access-key");
  await page.getByRole("button", { name: "Entrar al laboratorio" }).click();
  await expect(
    page.getByRole("heading", { name: "Orientación en TC craneal sintética" }),
  ).toBeVisible();
  const frame = page.frameLocator('iframe[title="Visor DICOM OHIF"]');
  await expect(frame.getByText(/I:\d+ \(1\/16\)/)).toBeVisible({
    timeout: 30000,
  });
  await frame.getByText("Skip all").click();
  await frame.getByText("Confirm and hide").click();
  await frame.locator("canvas").first().hover();
  await page.mouse.wheel(0, 540);
  await expect(frame.getByText(/I:\d+ \(2\/16\)/)).toBeVisible();
  expect(frames).toContain(200);
  const qido = await page.request.get(
    "/dicomweb/studies?StudyInstanceUID=" + uid,
  );
  expect(qido.ok()).toBeTruthy();
  const studies = (await qido.json()) as unknown[];
  expect(studies.length).toBe(1);
  const wado = await page.request.get("/dicomweb/studies/" + uid + "/metadata");
  expect(wado.ok()).toBeTruthy();
  await page.getByLabel("De superior a inferior").check();
  await page.getByRole("button", { name: "Enviar respuesta" }).click();
  await expect(page.getByText(/Correcto · 100 puntos/)).toBeVisible();
  const progress = await page.request.get("/api/lab/progress");
  const data = (await progress.json()) as { cases: { attempts: number }[] };
  expect(data.cases[0]?.attempts).toBeGreaterThan(0);
});
test("mobile activity panel and GPA shell meet serious WCAG checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/");
  await page.getByLabel("Clave de acceso local").fill("local-demo-access-key");
  await page.getByRole("button", { name: "Entrar al laboratorio" }).click();
  await expect(page.getByRole("button", { name: "Actividades" })).toBeVisible();
  await page.getByRole("button", { name: "Actividades" }).click();
  await expect(
    page.getByRole("heading", { name: "Análisis clínico" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .exclude("iframe")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
});
test("admin can create a draft case and question through protected UI", async ({
  page,
}) => {
  const key = readFileSync(
    new URL("../.dev.vars", import.meta.url),
    "utf8",
  ).match(/^ADMIN_KEY=(.*)$/m)?.[1];
  expect(key).toBeTruthy();
  await page.goto("/lab/admin");
  await page.getByLabel("Clave administrativa").fill(key!);
  await page.getByRole("button", { name: "Acceder" }).click();
  await expect(
    page.getByRole("heading", { name: "Casos y publicación" }),
  ).toBeVisible();
  const id = "GPA-E2E-" + Date.now();
  const form = page.locator(".admin-grid form").first();
  const values: Record<string, string> = {
    id,
    title: "Caso de prueba administrativo",
    specialty: "Neurorradiología",
    category: "Neuroimágenes",
    modality: "CT",
    region: "Cráneo",
    difficulty: "Básica",
    studyUid: "1.2.826.0.1.3680043.10.543." + Date.now(),
    clinicalDescription: "Caso sintético de prueba.",
    bibliography: "Fuente de prueba.",
    explanation: "Explicación de prueba.",
    objectives: "Navegar cortes|Reconocer plano",
  };
  for (const [name, value] of Object.entries(values))
    await form.locator(`input[name="${name}"]`).fill(value);
  await form.getByRole("button", { name: "Crear borrador" }).click();
  await expect(
    page.getByText(new RegExp(id + " · Caso de prueba administrativo · draft")),
  ).toBeVisible();
  const question = page.locator(".admin-grid form").last();
  const q: Record<string, string> = {
    id: "GPA-E2E-Q-" + Date.now(),
    caseId: id,
    kind: "multiple_choice",
    prompt: "¿Cuál es el plano?",
    options: "Axial|Sagital",
    answer: "0",
    explanation: "El plano es axial.",
    source: "Fuente sintética",
    difficulty: "Básica",
  };
  for (const [name, value] of Object.entries(q))
    await question.locator(`input[name="${name}"]`).fill(value);
  await question.getByRole("button", { name: "Añadir pregunta" }).click();
  await expect(page.getByRole("status")).toHaveText("Pregunta añadida.");
  await page
    .locator(".admin-row")
    .filter({ hasText: id })
    .getByRole("button", { name: "Publicar" })
    .click();
  await expect(
    page.locator(".admin-row").filter({ hasText: id }),
  ).toContainText("published");
  await page
    .locator(".admin-row")
    .filter({ hasText: id })
    .getByRole("button", { name: "Despublicar" })
    .click();
  await expect(
    page.locator(".admin-row").filter({ hasText: id }),
  ).toContainText("draft");
});
