import { test, expect } from "@playwright/test";
import { DevToolPage } from "../pages/dev-tool.page";

test.describe("Vision & Audio AI (F9-F11)", () => {
  test("Background Removal page loads", async ({ page }) => {
    const toolPage = new DevToolPage(page);
    await toolPage.goto("/ai/background-removal");
    await toolPage.expectTitleContains("Background");
  });

  test("Background Removal shows upload area", async ({ page }) => {
    await page.goto("/ai/background-removal");
    // Should have a drop zone or file input
    const uploadArea = page.getByText(/drop|upload|choose/i);
    await expect(uploadArea.first()).toBeVisible();
  });

  test("OCR page loads", async ({ page }) => {
    const toolPage = new DevToolPage(page);
    await toolPage.goto("/ai/ocr");
    await toolPage.expectTitleContains("OCR");
  });

  test("OCR shows upload or paste area", async ({ page }) => {
    await page.goto("/ai/ocr");
    const body = await page.textContent("body");
    // Should mention paste, upload, or drop
    expect(body?.toLowerCase()).toMatch(/paste|upload|drop|image/);
  });

  test("Transcribe page loads", async ({ page }) => {
    const toolPage = new DevToolPage(page);
    await toolPage.goto("/ai/transcribe");
    await toolPage.expectTitleContains("Transcri");
  });

  test("Transcribe shows model selector", async ({ page }) => {
    await page.goto("/ai/transcribe");
    // Whisper model selector should be present
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toMatch(/whisper|model|tiny|base|small/);
  });
});
