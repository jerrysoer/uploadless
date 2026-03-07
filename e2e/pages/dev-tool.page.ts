import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Generic Page Object for any dev tool page.
 * All tool pages share the ToolPageHeader pattern with h1 + description.
 */
export class DevToolPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
  }

  async goto(path: string) {
    const response = await this.page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(this.heading).toBeVisible();
  }

  async expectTitleContains(text: string) {
    await expect(this.heading).toContainText(text, { ignoreCase: true });
  }
}
