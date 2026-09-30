import { HomePage } from './home-page';

/** The coupon list at /:organization_id/home/coupons. */
export class CouponsPage extends HomePage {
  // The header says "Add Coupon" and the empty state "Add coupon"; accessible
  // name matching ignores the case, so one locator finds whichever is showing.
  readonly addCouponButton = this.page.getByRole('button', { name: 'Add coupon' }).first();
  readonly searchBox = this.page.getByPlaceholder('Search coupons');
  readonly emptyState = this.page.getByText('You haven’t created any coupons.');

  async goto(organizationId: string): Promise<void> {
    await this.open(`/${organizationId}/home/coupons`);
  }

  async search(name: string): Promise<void> {
    await this.searchBox.fill(name);
  }
}
