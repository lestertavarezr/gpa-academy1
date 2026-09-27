// Idempotent production deploy, used by the GitHub Actions "deploy" job (and runnable locally).
// Needs CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and NEUROSCAN_ADMIN_TOKEN; NEUROSCAN_CONTACT_EMAIL is optional.
//   1. finds the D1 database "neuroscan" (creates it the first time) and points wrangler.toml at it
//   2. applies pending D1 migrations
//   3. deploys the Worker with the already built dist/web
//   4. stores ADMIN_TOKEN, and generates VAPID keys only if the Worker has none, so they are
//      created inside Cloudflare once and never rotate by accident
// Expects `npm run build` to have run.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { generateVapidKeys } from "./generate-vapid.mjs";

export const DB_NAME = "neuroscan";
const MIN_ADMIN_TOKEN = 24;

// Wrangler can print notices such as "▲ [WARNING] …" before the JSON, so try each line starting with "[".
export function parseJsonArray(output) {
  const lines = output.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("[")) continue;
    try {
      const value = JSON.parse(lines.slice(i).join("\n"));
      if (Array.isArray(value)) return value;
    } catch {
      // Not the JSON payload; keep looking.
    }
  }
  throw new Error(`Respuesta inesperada de wrangler:\n${output}`);
}

export function setDatabaseId(toml, id) {
  const pattern = /(database_name = "neuroscan"\s*\ndatabase_id = )"[^"]*"/;
  if (!pattern.test(toml)) throw new Error('No encontré database_id del binding "neuroscan" en wrangler.toml');
  return toml.replace(pattern, `$1"${id}"`);
}

export async function deploy({ env, run, readToml, writeToml, fetchImpl = fetch, generateKeys = generateVapidKeys, log = console.log, sleep }) {
  const missing = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NEUROSCAN_ADMIN_TOKEN"].filter((name) => !env[name]);
  if (missing.length) throw new Error(`Faltan secretos en GitHub: ${missing.join(", ")}`);
  if (env.NEUROSCAN_ADMIN_TOKEN.length < MIN_ADMIN_TOKEN) throw new Error(`NEUROSCAN_ADMIN_TOKEN debe tener al menos ${MIN_ADMIN_TOKEN} caracteres`);
  const email = env.NEUROSCAN_CONTACT_EMAIL?.trim();
  if (email && !/^[^\s@:]+@[^\s@:]+\.[^\s@:]+$/.test(email)) throw new Error("NEUROSCAN_CONTACT_EMAIL no es un correo válido");

  const findDb = () => parseJsonArray(run(["d1", "list", "--json"])).find((db) => db.name === DB_NAME);
  let db = findDb();
  if (!db) {
    log(`Creando la base D1 "${DB_NAME}"…`);
    run(["d1", "create", DB_NAME]);
    db = findDb();
    if (!db) throw new Error(`La base D1 "${DB_NAME}" no aparece después de crearla`);
  }
  log(`Base D1: ${DB_NAME} (${db.uuid})`);
  writeToml(setDatabaseId(readToml(), db.uuid));

  run(["d1", "migrations", "apply", DB_NAME, "--remote"]);

  const deployArgs = ["deploy"];
  if (email) deployArgs.push("--var", `VAPID_SUBJECT:mailto:${email}`);
  const deployOutput = run(deployArgs);
  const url = /https:\/\/[a-z0-9.-]+\.workers\.dev/i.exec(deployOutput)?.[0] ?? null;

  const existing = parseJsonArray(run(["secret", "list", "--format", "json"])).map((s) => s.name);
  const secrets = { ADMIN_TOKEN: env.NEUROSCAN_ADMIN_TOKEN };
  const vapidReady = existing.includes("VAPID_PUBLIC_KEY") && existing.includes("VAPID_PRIVATE_KEY");
  if (!vapidReady) Object.assign(secrets, await generateKeys());
  run(["secret", "bulk"], { input: JSON.stringify(secrets) });
  log(vapidReady ? "Claves VAPID existentes conservadas." : "Claves VAPID generadas y guardadas como secretos del Worker.");

  let health = null;
  if (url) {
    for (let attempt = 0; attempt < 12 && !health?.ok; attempt++) {
      if (attempt) await sleep(5000);
      health = await fetchImpl(`${url}/api/v1/health`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    }
    if (!health?.ok) throw new Error(`El Worker no responde en ${url}/api/v1/health`);
    if (!health.push) log("Aviso: /api/v1/health indica push=false; puede tardar unos segundos en aplicar los secretos.");
  }
  return { url, databaseId: db.uuid, generatedVapid: !vapidReady, health };
}

function wranglerRunner(cwd) {
  return (args, { input } = {}) => {
    const result = spawnSync("npx", ["wrangler", ...args], {
      cwd,
      input,
      encoding: "utf8",
      stdio: [input === undefined ? "inherit" : "pipe", "pipe", "inherit"],
      maxBuffer: 16 * 1024 * 1024,
    });
    // `secret bulk` reads secrets from stdin; nothing else we run prints secrets to stdout.
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.status !== 0) throw new Error(`wrangler ${args.slice(0, 2).join(" ")} falló (código ${result.status})`);
    return result.stdout;
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = new URL("..", import.meta.url);
  const tomlPath = new URL("wrangler.toml", root);
  if (!fs.existsSync(new URL("dist/web/index.html", root))) {
    console.error("Falta dist/web: ejecuta npm run build antes de desplegar.");
    process.exit(1);
  }
  try {
    const result = await deploy({
      env: process.env,
      run: wranglerRunner(root.pathname),
      readToml: () => fs.readFileSync(tomlPath, "utf8"),
      writeToml: (text) => fs.writeFileSync(tomlPath, text),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    });
    const summary = [
      "## NEURO//SCAN desplegado",
      result.url ? `- App: ${result.url}\n- Panel de estadísticas: ${result.url}/admin.html` : "- URL: revisa la salida de `wrangler deploy` (rutas personalizadas)",
      `- Base D1: \`${result.databaseId}\``,
      `- Claves VAPID: ${result.generatedVapid ? "generadas en este despliegue" : "conservadas"}`,
      result.health ? `- Salud: ${result.health.challenges} desafíos, push ${result.health.push ? "activo" : "pendiente"}` : "",
    ].filter(Boolean);
    console.log(`\n${summary.join("\n")}`);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join("\n")}\n`);
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
}
