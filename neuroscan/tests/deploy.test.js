import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { deploy, setDatabaseId } from "../scripts/deploy.mjs";

const TOML = fs.readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
const DB = { uuid: "1111aaaa-2222-bbbb-3333-cccc4444dddd", name: "neuroscan" };
const ENV = { CLOUDFLARE_API_TOKEN: "t", CLOUDFLARE_ACCOUNT_ID: "a", NEUROSCAN_ADMIN_TOKEN: "x".repeat(32) };

// Simulates the parts of the wrangler CLI and Cloudflare that the deploy script touches.
function fakeCloudflare({ databases = [], secrets = [] } = {}) {
  const cf = { databases: [...databases], secrets: [...secrets], calls: [], bulk: null, toml: TOML };
  cf.run = (args, { input } = {}) => {
    cf.calls.push(args.join(" "));
    const cmd = args.slice(0, 2).join(" ");
    if (cmd === "d1 list") return `[WARNING] proxy detected\n${JSON.stringify(cf.databases, null, 2)}`;
    if (cmd === "d1 create") return cf.databases.push({ ...DB }), "✅ Successfully created DB";
    if (cmd === "d1 migrations") return "🚣 1 command executed successfully";
    if (args[0] === "deploy") return "Uploaded neuroscan\n  https://neuroscan.gpa.workers.dev\nCurrent Version ID: abc";
    if (cmd === "secret list") return JSON.stringify(cf.secrets.map((name) => ({ name, type: "secret_text" })));
    if (cmd === "secret bulk") {
      cf.bulk = JSON.parse(input);
      cf.secrets = [...new Set([...cf.secrets, ...Object.keys(cf.bulk)])];
      return "✨ Success";
    }
    throw new Error(`unexpected wrangler ${args.join(" ")}`);
  };
  cf.options = (overrides = {}) => ({
    env: ENV,
    run: cf.run,
    readToml: () => cf.toml,
    writeToml: (text) => (cf.toml = text),
    fetchImpl: async () => new Response(JSON.stringify({ ok: true, challenges: 98, push: true })),
    generateKeys: async () => ({ VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv" }),
    log: () => {},
    sleep: async () => {},
    ...overrides,
  });
  return cf;
}

describe("deploy", () => {
  it("provisions everything on the first deploy", async () => {
    const cf = fakeCloudflare();
    const result = await deploy(cf.options());
    expect(cf.calls).toEqual([
      "d1 list --json",
      "d1 create neuroscan",
      "d1 list --json",
      "d1 migrations apply neuroscan --remote",
      "deploy",
      "secret list --format json",
      "secret bulk",
    ]);
    expect(cf.toml).toContain(`database_id = "${DB.uuid}"`);
    expect(cf.bulk).toEqual({ ADMIN_TOKEN: ENV.NEUROSCAN_ADMIN_TOKEN, VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv" });
    expect(result).toMatchObject({ url: "https://neuroscan.gpa.workers.dev", databaseId: DB.uuid, generatedVapid: true });
  });

  it("reuses the database and never rotates existing VAPID keys", async () => {
    const cf = fakeCloudflare({ databases: [{ uuid: "other", name: "otra-app" }, DB], secrets: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "ADMIN_TOKEN"] });
    const result = await deploy(cf.options());
    expect(cf.calls).not.toContain("d1 create neuroscan");
    expect(cf.bulk).toEqual({ ADMIN_TOKEN: ENV.NEUROSCAN_ADMIN_TOKEN });
    expect(result.generatedVapid).toBe(false);
  });

  it("passes the contact email as the VAPID subject", async () => {
    const cf = fakeCloudflare({ databases: [DB] });
    await deploy(cf.options({ env: { ...ENV, NEUROSCAN_CONTACT_EMAIL: " academia@gpa.do " } }));
    expect(cf.calls).toContain("deploy --var VAPID_SUBJECT:mailto:academia@gpa.do");
  });

  it.each([
    ["missing secrets", { CLOUDFLARE_API_TOKEN: "" }, /Faltan secretos en GitHub: CLOUDFLARE_API_TOKEN/],
    ["a short admin token", { NEUROSCAN_ADMIN_TOKEN: "corto" }, /al menos 24/],
    ["a malformed email", { NEUROSCAN_CONTACT_EMAIL: "no es correo" }, /correo válido/],
  ])("refuses to start with %s", async (_name, env, message) => {
    const cf = fakeCloudflare();
    await expect(deploy(cf.options({ env: { ...ENV, ...env } }))).rejects.toThrow(message);
    expect(cf.calls).toEqual([]);
  });

  it("fails loudly when the deployed Worker is not healthy", async () => {
    const cf = fakeCloudflare({ databases: [DB] });
    await expect(deploy(cf.options({ fetchImpl: async () => new Response("down", { status: 503 }) }))).rejects.toThrow(/no responde/);
  });
});

describe("setDatabaseId", () => {
  it("only rewrites the neuroscan binding id and keeps the comment", () => {
    const out = setDatabaseId(TOML, DB.uuid);
    expect(out).toContain(`database_id = "${DB.uuid}" # set at deploy time`);
    expect(out.replace(DB.uuid, "00000000-0000-0000-0000-000000000000")).toBe(TOML);
  });
});
