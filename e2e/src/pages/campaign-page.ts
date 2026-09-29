import { HomePage } from './home-page';

/**
 * A single campaign, at
 * /:organization_id/home/coupons/:coupon_id/campaigns/:campaign_id — its
 * details, its summary tiles, and the coupon codes under it.
 *
 * `row` and `chooseRowAction` address the coupon code table.
 */
export class CampaignPage extends HomePage {
  readonly editButton = this.page.getByRole('button', { name: 'Edit' });
  readonly createCouponCodeButton = this.page.getByRole('button', {
    name: 'Create coupon code',
  });
  readonly searchBox = this.page.getByPlaceholder('Search coupon codes');

  async goto(organizationId: string, couponId: string, campaignId: string): Promise<void> {
    await this.open(
      `/${organizationId}/home/coupons/${couponId}/campaigns/${campaignId}`,
    );
  }

  async search(code: string): Promise<void> {
    await this.searchBox.fill(code);
  }

  /**
   * The campaign's own status, shown beside its name — ahead of the coupon
   * code table, which labels its rows with the same words.
   */
  status(value: 'Active' | 'Inactive' | 'Exhausted') {
    return this.page.getByText(value, { exact: true }).first();
  }
}
