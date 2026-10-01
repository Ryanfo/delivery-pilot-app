import { defineConfig, devices } from "@playwright/test";

// The delivery coordinator allocates a unique port per run (PORT / E2E_PORT) so that
// concurrent sessions never collide. Never assume a fixed port.
const port = Number(process.env.E2E_PORT ?? process.env.PORT ?? 5173);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "list" : "line",
  outputDir: process.env.TMPDIR ? `${process.env.TMPDIR}/playwright-results` : "test-results",
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
