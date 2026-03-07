import { test, expect } from "@playwright/test";
import { DevToolPage } from "../pages/dev-tool.page";

/**
 * Tier 3 (Code model), Tier 4 (Reasoning), Tier 5 (Ollama-only).
 * Verifies each route loads with HTTP 200 and renders an h1.
 */

const TIER_3_TOOLS = [
  { path: "/ai/commit-msg", titleContains: "Commit" },
  { path: "/ai/code-explain", titleContains: "Code" },
  { path: "/ai/code-review", titleContains: "Code" },
  { path: "/ai/error-decode", titleContains: "Error" },
  { path: "/ai/sql-gen", titleContains: "SQL" },
  { path: "/ai/test-gen", titleContains: "Test" },
  { path: "/ai/pr-desc", titleContains: "PR" },
  { path: "/ai/readme-gen", titleContains: "README" },
] as const;

const TIER_4_TOOLS = [
  { path: "/ai/swot", titleContains: "SWOT" },
  { path: "/ai/sentiment", titleContains: "Sentiment" },
  { path: "/ai/keywords", titleContains: "Keyword" },
] as const;

const TIER_5_TOOLS = [
  { path: "/ai/long-doc", titleContains: "Long" },
  { path: "/ai/full-review", titleContains: "Code" },
  { path: "/ai/tech-writing", titleContains: "Tech" },
] as const;

test.describe("AI Tier 3 — Code Model Tools", () => {
  for (const { path, titleContains } of TIER_3_TOOLS) {
    test(`${path} loads with correct heading`, async ({ page }) => {
      const toolPage = new DevToolPage(page);
      await toolPage.goto(path);
      await toolPage.expectTitleContains(titleContains);
    });
  }
});

test.describe("AI Tier 4 — Reasoning Model Tools", () => {
  for (const { path, titleContains } of TIER_4_TOOLS) {
    test(`${path} loads with correct heading`, async ({ page }) => {
      const toolPage = new DevToolPage(page);
      await toolPage.goto(path);
      await toolPage.expectTitleContains(titleContains);
    });
  }
});

test.describe("AI Tier 5 — Ollama-Only Tools", () => {
  for (const { path, titleContains } of TIER_5_TOOLS) {
    test(`${path} loads with correct heading`, async ({ page }) => {
      const toolPage = new DevToolPage(page);
      await toolPage.goto(path);
      await toolPage.expectTitleContains(titleContains);
    });
  }

  test("Tier 5 tools show Ollama requirement when not connected", async ({
    page,
  }) => {
    await page.goto("/ai/long-doc");
    // OllamaGate should show fallback when Ollama isn't running
    const ollamaMsg = page.getByText(/ollama/i);
    await expect(ollamaMsg.first()).toBeVisible();
  });
});
