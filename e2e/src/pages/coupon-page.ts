import { HomePage } from './home-page';

/**
 * A single coupon at /:organization_id/home/coupons/:coupon_id: its details,
 * its summary tiles, and a tab holding the campaigns beneath it.
 *
 * `row` and `chooseRowAction` address the campaign table.
 */
export class CouponPage extends HomePage {
  readonly editButton = this.page.getByRole('button', { name: 'Edit' });
  readonly actionsButton = this.page.getByRole('button', { name: 'Coupon actions' });
  readonly createCampaignButton = this.page.getByRole('button', { name: 'Create campaign' });
  readonly searchBox = this.page.getByPlaceholder('Search campaigns');
  readonly eligibleItemsTab = this.page.getByRole('tab', { name: 'Eligible items' });

  async goto(organizationId: string, couponId: string): Promise<void> {
    await this.open(`/${organizationId}/home/coupons/${couponId}`);
  }

  async search(name: string): Promise<void> {
    await this.searchBox.fill(name);
  }

  /** Picks an entry out of the coupon's own overflow menu, beside "Edit". */
  async chooseCouponAction(action: 'Delete' | 'Change Status'): Promise<void> {
    await this.actionsButton.click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }
}
