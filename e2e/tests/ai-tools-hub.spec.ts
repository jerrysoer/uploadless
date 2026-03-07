import { test, expect } from "@playwright/test";
import { AIToolsHubPage } from "../pages/ai-tools-hub.page";

test.describe("AI Tools Hub", () => {
  let hubPage: AIToolsHubPage;

  test.beforeEach(async ({ page }) => {
    hubPage = new AIToolsHubPage(page);
    await hubPage.goto();
  });

  test("displays AI Tools heading", async () => {
    await expect(hubPage.heading).toContainText("AI Tools");
  });

  test("shows three tabs: Summarize, Rewrite, All AI Tools", async ({
    page,
  }) => {
    // Tab buttons live inside a tab switcher container
    const tabs = page.locator("button");
    await expect(tabs.filter({ hasText: "Summarize" }).first()).toBeVisible();
    await expect(tabs.filter({ hasText: "Rewrite" }).first()).toBeVisible();
    await expect(tabs.filter({ hasText: "All AI Tools" }).first()).toBeVisible();
  });

  test("shows Model Store link in header", async () => {
    await expect(hubPage.modelStoreLink).toBeVisible();
  });

  test("Model Store link navigates to /ai/models", async ({ page }) => {
    await hubPage.modelStoreLink.click();
    await expect(page).toHaveURL(/\/ai\/models/);
  });

  test("All AI Tools tab shows tool groups", async ({ page }) => {
    await hubPage.switchToAllTools();

    await expect(page.getByText("Text & Communication")).toBeVisible();
    await expect(page.getByText("Document Analysis")).toBeVisible();
    await expect(page.getByText("Code & Development")).toBeVisible();
    await expect(page.getByText("Analysis & Research")).toBeVisible();
    await expect(page.getByText("Vision & Audio")).toBeVisible();
    await expect(page.getByText("Advanced (Ollama)")).toBeVisible();
  });

  test("Summarize tab shows text input area", async ({ page }) => {
    await hubPage.switchToSummarize();
    const textarea = page.getByRole("textbox").first();
    await expect(textarea).toBeVisible();
  });

  test("Rewrite tab shows text input area", async ({ page }) => {
    await hubPage.switchToRewrite();
    const textarea = page.getByRole("textbox").first();
    await expect(textarea).toBeVisible();
  });

  test("tool links navigate to correct routes", async ({ page }) => {
    await hubPage.switchToAllTools();

    // Click first tool in "Text & Communication"
    const privacyLink = page.getByRole("link", {
      name: /Privacy Policy/i,
    });
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expect(page).toHaveURL(/\/ai\/privacy-policy/);
  });
});
