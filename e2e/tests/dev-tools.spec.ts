import { test, expect } from "@playwright/test";
import { DevToolPage } from "../pages/dev-tool.page";

/**
 * Dev tools (F12) — route loading + basic UI verification.
 */

const DEV_TOOLS = [
  { path: "/tools/format-convert", titleContains: "Convert" },
  { path: "/tools/sql-format", titleContains: "SQL" },
  { path: "/tools/ip-calc", titleContains: "IP" },
  { path: "/tools/units", titleContains: "Unit" },
  { path: "/tools/useragent", titleContains: "User" },
  { path: "/tools/env-validate", titleContains: "Env" },
  { path: "/tools/robots", titleContains: "robots" },
  { path: "/tools/csp", titleContains: "CSP" },
] as const;

test.describe("Dev Tools (F12) — Route Loading", () => {
  for (const { path, titleContains } of DEV_TOOLS) {
    test(`${path} loads with correct heading`, async ({ page }) => {
      const toolPage = new DevToolPage(page);
      await toolPage.goto(path);
      await toolPage.expectTitleContains(titleContains);
    });
  }
});
