import { HomePage } from './home-page';

/**
 * A single coupon code, at
 * /:organization_id/home/coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id
 * — what the code is, who may use it, its limits, and what has been redeemed
 * against it.
 *
 * `row` addresses the redemption table.
 */
export class CouponCodePage extends HomePage {
  readonly editButton = this.page.getByRole('button', { name: 'Edit', exact: true });
  readonly editDetailsButton = this.page.getByRole('button', { name: 'Edit details' });
  readonly redemptionsSearchBox = this.page.getByPlaceholder('Search customer by email');
  readonly noRedemptions = this.page.getByText('No redemptions to show');

  async goto(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ): Promise<void> {
    await this.open(
      `/${organizationId}/home/coupons/${couponId}` +
        `/campaigns/${campaignId}/coupon-codes/${couponCodeId}`,
    );
  }

  async searchRedemptions(email: string): Promise<void> {
    await this.redemptionsSearchBox.fill(email);
  }
}
