import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for /ai/models — the Model Store.
 * Encapsulates selectors and actions for the 5-pack model registry,
 * storage meter, Ollama section, and capability badges.
 */
export class ModelStorePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly storageMeter: Locator;
  readonly webllmSection: Locator;
  readonly ollamaSection: Locator;
  readonly modelCards: Locator;
  readonly downloadButtons: Locator;
  readonly switchButtons: Locator;
  readonly capabilityBadges: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.storageMeter = page.getByText("Browser Storage");
    this.webllmSection = page.getByText("WebLLM Model Packs");
    this.ollamaSection = page.getByText("Local Models (Ollama)");
    this.modelCards = page.locator("[class*='border']").filter({ hasText: /Tiny|Balanced|General|Code|Reasoning/ });
    this.downloadButtons = page.getByRole("button", { name: /Download/i });
    this.switchButtons = page.getByRole("button", { name: /Switch/i });
    this.capabilityBadges = page.getByText("classification");
  }

  async goto() {
    await this.page.goto("/ai/models");
    await expect(this.heading).toBeVisible();
  }

  async getActionButtonCount(): Promise<number> {
    const downloads = await this.downloadButtons.count();
    const switches = await this.switchButtons.count();
    return downloads + switches;
  }
}
