import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: "on-first-retry"
  },
  webServer: {
    command: "node scripts/serve-site.mjs",
    port: 4173,
    reuseExistingServer: true,
    timeout: 30_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        viewport: { width: 1440, height: 960 }
      }
    }
  ]
});

