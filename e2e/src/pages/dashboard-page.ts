import type { Locator } from '@playwright/test';
import { HomePage } from './home-page';

/**
 * The dashboard at /:organization_id/home/dashboard: headline sales figures,
 * what is most popular, and the latest redemptions.
 *
 * Every figure on it is read out of a materialized view the API refreshes on a
 * timer, so after arranging a redemption reach the page through
 * `reloadUntilVisible` rather than asserting straight away.
 *
 * `row` addresses the recent redemptions table.
 */
export class DashboardPage extends HomePage {
  readonly viewAllRedemptions = this.page.getByText('View all redemptions');
  readonly emptyState = this.page.getByText('No redemptions to show');

  async goto(organizationId: string): Promise<void> {
    await this.open(`/${organizationId}/home/dashboard`);
  }

  /**
   * The tile for a headline figure — "Total redemptions", "Gross sales",
   * "Discount" or "Net sales". Nothing ties a tile's label to its value for a
   * screen reader, so the card around both is what a test has to scope to.
   */
  figure(label: string): Locator {
    return this.page.locator('mat-card').filter({ hasText: label });
  }
}
