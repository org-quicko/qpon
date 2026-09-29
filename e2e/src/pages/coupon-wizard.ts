import type { Locator } from '@playwright/test';
import { Wizard } from './wizard';

/**
 * The coupon flow at /:organization_id/coupons/..., which walks four screens
 * behind one bottom bar: the coupon itself, the items it applies to, a first
 * campaign, and a first coupon code (see {@link CouponCodeWizard}). Each screen
 * saves as you leave it, so "Next" is also what creates the coupon, and the
 * later screens are reachable on their own — editing a coupon or adding a
 * campaign to an existing one opens straight onto one of them.
 */
export class CouponWizard extends Wizard {
  // Step 1 — the coupon.
  readonly name: Locator = this.page.getByLabel('Coupon name');
  readonly percentage: Locator = this.choice('Percentage');
  readonly fixedAmount: Locator = this.choice('Fixed amount');
  readonly percentageOff: Locator = this.page.getByLabel('Percentage off');
  readonly fixedAmountOff: Locator = this.page.getByLabel('Fixed amount off');
  readonly setMaxAmount: Locator = this.choice('Set max amount');
  readonly noMaxAmount: Locator = this.choice('No max amount');
  readonly maxAmount: Locator = this.page.getByLabel('Maximum discount amount');

  // Step 2 — where the coupon applies.
  readonly allItems: Locator = this.choice('All items');
  readonly specificItems: Locator = this.choice('Specific items');
  readonly itemSearch: Locator = this.page.getByLabel('Search items by name');

  // Step 3 — the first campaign.
  readonly campaignName: Locator = this.page.getByLabel('Campaign name');
  readonly limitedBudget: Locator = this.choice('Limited budget');
  readonly unlimitedBudget: Locator = this.choice('Unlimited budget');
  readonly budgetAmount: Locator = this.page.getByLabel('Budget amount');

  /**
   * Names the coupon and sets a percentage discount — the shape of coupon most
   * tests want before moving on to the screen they actually care about.
   */
  async fillCoupon(name: string, percentOff: number): Promise<void> {
    await this.name.fill(name);
    await this.percentage.click();
    await this.percentageOff.fill(String(percentOff));
  }

  /** Picks an item out of the "Specific items" autocomplete. */
  async chooseItem(itemName: string): Promise<void> {
    await this.itemSearch.fill(itemName);
    await this.page.getByRole('option', { name: new RegExp(itemName) }).click();
  }
}
