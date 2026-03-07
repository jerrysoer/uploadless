import { test, expect } from "@playwright/test";

test.describe("Navigation & Cross-Cutting", () => {
  test("tools page shows dev tool groups in accordion", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Verify new tool groups are rendered
    await expect(page.getByText("Data & DevOps")).toBeVisible();
    await expect(page.getByText("Config & Security")).toBeVisible();
  });

  test("tools page lists new Phase 2 tools", async ({ page }) => {
    await page.goto("/tools");

    // Check that new tools appear in the accordion content
    await expect(page.getByText("SQL Formatter")).toBeVisible();
    await expect(page.getByText("IP / Subnet Calculator")).toBeVisible();
    await expect(page.getByText("Unit Converter")).toBeVisible();
    await expect(page.getByText("User-Agent Parser")).toBeVisible();
  });

  test("tools page lists new config tools", async ({ page }) => {
    await page.goto("/tools");

    await expect(page.getByText(".env Validator")).toBeVisible();
    await expect(page.getByText("robots.txt Generator")).toBeVisible();
    await expect(page.getByText("CSP Header Builder")).toBeVisible();
  });

  test("TOML converter is listed in Encode & Transform", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByText("TOML Converter")).toBeVisible();
  });
});
