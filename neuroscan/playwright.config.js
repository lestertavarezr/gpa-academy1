import { defineConfig, devices } from "@playwright/test";

// RFC 8291 example keys: public test values, only used against the local dev server.
const TEST_VAPID_PUBLIC = "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
const TEST_VAPID_PRIVATE = "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: "http://127.0.0.1:8787", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec\.js/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.js/ },
  ],
  webServer: {
    command:
      "npm run build && npx wrangler d1 migrations apply neuroscan --local && " +
      `npx wrangler dev --port 8787 --ip 127.0.0.1 --var ADMIN_TOKEN:e2e-admin-token --var VAPID_PUBLIC_KEY:${TEST_VAPID_PUBLIC} --var VAPID_PRIVATE_KEY:${TEST_VAPID_PRIVATE}`,
    url: "http://127.0.0.1:8787/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
