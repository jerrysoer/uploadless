import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for /ai — the AI Tools Hub.
 * Encapsulates the tab switcher, tool directory, and Model Store link.
 */
export class AIToolsHubPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly summarizeTab: Locator;
  readonly rewriteTab: Locator;
  readonly allToolsTab: Locator;
  readonly modelStoreLink: Locator;
  readonly toolGroupHeadings: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    // Tab buttons are inside a p-1 tab switcher div; use first() to avoid
    // matching the form's "Summarize" submit button inside AISummarizer.
    this.summarizeTab = page.getByRole("button", { name: "Summarize" }).first();
    this.rewriteTab = page.getByRole("button", { name: "Rewrite" }).first();
    this.allToolsTab = page.getByRole("button", { name: "All AI Tools" });
    this.modelStoreLink = page.getByRole("link", { name: /Model Store/i });
    this.toolGroupHeadings = page.getByText("Text & Communication");
  }

  async goto() {
    await this.page.goto("/ai");
    await expect(this.heading).toBeVisible();
  }

  async switchToAllTools() {
    await this.allToolsTab.click();
    await expect(this.toolGroupHeadings).toBeVisible();
  }

  async switchToSummarize() {
    await this.summarizeTab.click();
  }

  async switchToRewrite() {
    await this.rewriteTab.click();
  }
}
