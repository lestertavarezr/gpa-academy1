import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:8080", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:8788/api/lab/health",
    reuseExistingServer: true,
    timeout: 180000,
  },
});
