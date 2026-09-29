import type { Locator, Page } from '@playwright/test';

/**
 * The organization picker at /organizations, which is where signing in lands.
 * It sits outside the app shell, so it has no role banner to wait on.
 */
export class OrganizationsPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByText('Welcome back! You look good today.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/organizations', { waitUntil: 'domcontentloaded' });
  }

  /** An organization in the list. Clicking it opens that organization. */
  organization(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }
}
