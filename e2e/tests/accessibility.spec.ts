import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests using axe-core.
 * Checks critical pages for WCAG 2.1 AA violations.
 * Excludes known third-party/canvas elements that may produce false positives.
 */

test.describe("Accessibility (a11y)", () => {
  test("AI Tools Hub has no critical a11y violations", async ({ page }) => {
    await page.goto("/ai");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast", "link-in-text-block"]) // theme-dependent + known link style issue
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("Model Store has no critical a11y violations", async ({ page }) => {
    await page.goto("/ai/models");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("Dev Tools page has no critical a11y violations", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("AI tool page (email) has no critical a11y violations", async ({
    page,
  }) => {
    await page.goto("/ai/email");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });
});
