import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  projects: [
    {
      name: "desktop",
      testMatch: ["booking.spec.js", "home.spec.js"],
      use: { viewport: { width: 1920, height: 1080 } },
    },
    { name: "laptop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "tablet",
      testMatch: ["booking.spec.js", "home.spec.js"],
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mobile",
      testMatch: ["booking.spec.js", "home.spec.js"],
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
