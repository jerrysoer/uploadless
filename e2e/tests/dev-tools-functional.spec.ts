import { test, expect } from "@playwright/test";

test.describe("Dev Tools — Functional Tests", () => {
  test.describe("IP / Subnet Calculator", () => {
    test("calculates 192.168.1.0/24 correctly", async ({ page }) => {
      await page.goto("/tools/ip-calc");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const input = page.getByRole("textbox").first();
      await input.fill("192.168.1.0/24");

      // 254 usable hosts — use exact match to avoid matching "192.168.1.254"
      await expect(page.getByText("254", { exact: true })).toBeVisible({
        timeout: 3_000,
      });
    });

    test("shows network and broadcast addresses", async ({ page }) => {
      await page.goto("/tools/ip-calc");
      const input = page.getByRole("textbox").first();
      await input.fill("10.0.0.0/8");

      // Check for broadcast address which is unique
      await expect(page.getByText("10.255.255.255")).toBeVisible({
        timeout: 3_000,
      });
    });
  });

  test.describe("Unit Converter", () => {
    test("renders category options", async ({ page }) => {
      await page.goto("/tools/units");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const body = await page.textContent("body");
      // Should show unit categories
      expect(body).toMatch(/Length|Weight|Temperature/);
    });
  });

  test.describe("JSON / YAML / TOML Converter", () => {
    test("renders format selector", async ({ page }) => {
      await page.goto("/tools/format-convert");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const body = await page.textContent("body");
      expect(body).toMatch(/JSON|YAML|TOML/);
    });
  });

  test.describe("SQL Formatter", () => {
    test("renders with input area", async ({ page }) => {
      await page.goto("/tools/sql-format");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const textarea = page.getByRole("textbox");
      await expect(textarea.first()).toBeVisible();
    });
  });

  test.describe("CSP Header Builder", () => {
    test("renders with directive options", async ({ page }) => {
      await page.goto("/tools/csp");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const body = await page.textContent("body");
      expect(body).toMatch(/default-src|script-src|style-src/);
    });
  });

  test.describe("robots.txt Generator", () => {
    test("renders with user-agent presets", async ({ page }) => {
      await page.goto("/tools/robots");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const body = await page.textContent("body");
      expect(body).toMatch(/Googlebot|User-agent|Sitemap/i);
    });
  });

  test.describe(".env Validator", () => {
    test("renders with input area", async ({ page }) => {
      await page.goto("/tools/env-validate");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const textarea = page.getByRole("textbox");
      await expect(textarea.first()).toBeVisible();
    });
  });
});
