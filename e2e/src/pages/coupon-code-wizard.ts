import { expect, type Locator } from '@playwright/test';
import { Wizard } from './wizard';

/**
 * The coupon code screens. They are the last leg of the coupon flow and also
 * stand alone, at
 * /:organization_id/coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/create,
 * which is where the campaign page sends you. Three screens — the code, its
 * redemption limits, then who may use it — followed by a review screen that
 * saves every code entered so far at once.
 *
 * Editing splits the same fields over two screens, the code then its
 * customers, and saves each as you leave it.
 */
export class CouponCodeWizard extends Wizard {
  // Screen 1 — the code. The visibility tiles describe themselves in terms of
  // the coupon code, so both labels have to be matched exactly.
  readonly code: Locator = this.page.getByLabel('Code', { exact: true });
  readonly description: Locator = this.page.getByLabel('Description', { exact: true });
  readonly publicCode: Locator = this.choice('Public');
  readonly privateCode: Locator = this.choice('Private');
  readonly validForever: Locator = this.choice('Forever');
  readonly validUntil: Locator = this.choice('Limited');
  readonly expiryDate: Locator = this.page.getByLabel('Choose a date');

  // Screen 2 — redemption limits. Each amount is unlocked by its checkbox, and
  // every checkbox label starts with the label of the field it unlocks — so
  // these have to be matched exactly to tell the two apart.
  readonly setMinimumAmount: Locator = this.checkbox('Set minimum purchase amount');
  readonly minimumAmount: Locator = this.field('Minimum purchase amount');
  readonly setMaxRedemptions: Locator = this.checkbox('Set max redemptions');
  readonly maxRedemptions: Locator = this.field('Max redemptions');
  readonly setMaxRedemptionsPerCustomer: Locator = this.checkbox(
    'Set max redemptions per customer',
  );
  readonly maxRedemptionsPerCustomer: Locator = this.field('Max redemptions per customer');

  // Screen 3 — who may use it.
  readonly everyone: Locator = this.choice('Everyone');
  readonly specificCustomers: Locator = this.choice('Specific customers');
  readonly customerSearch: Locator = this.page.getByLabel('Search customers by email');

  // Review screen.
  readonly addAnotherCodeButton: Locator = this.page.getByRole('button', {
    name: 'Add another code',
  });

  /** The heading that names each screen. */
  readonly heading = {
    code: this.page.getByText('Craft your coupon code'),
    limits: this.page.getByText('Set redemption limit'),
    customers: this.page.getByText('Who can use this coupon code'),
    review: this.page.getByText('Create more coupon codes'),
  } as const;

  /**
   * Moves on, and waits for the next screen to take over before returning —
   * the screens swap in place, so clicking straight on can land on the one
   * being left behind.
   */
  async continueTo(screen: keyof CouponCodeWizard['heading']): Promise<void> {
    await this.nextButton.click();
    await expect(this.heading[screen]).toBeVisible();
  }

  /** The card standing for an entered-but-not-yet-saved code. */
  pendingCode(code: string): Locator {
    return this.page.getByText(code, { exact: true });
  }

  /**
   * Picks today out of the calendar the expiry field opens — the field itself
   * is read-only, so this is the only way in. Calendar cells carry no label,
   * so today is addressed by the number printed on it.
   *
   * Today rather than a fixed date because the picker refuses anything
   * earlier, and a date hard-coded in a test quietly becomes one.
   */
  async chooseExpiryToday(): Promise<void> {
    await this.expiryDate.click();
    await this.page
      .getByRole('gridcell')
      .filter({ hasText: new RegExp(`^\\s*${new Date().getDate()}\\s*$`) })
      .click();
    // The calendar covers the bar below it until it closes.
    await expect(this.page.getByRole('gridcell').first()).toBeHidden();
  }

  /** Picks a customer out of the "Specific customers" autocomplete. */
  async chooseCustomer(email: string): Promise<void> {
    await this.customerSearch.fill(email);
    await this.page.getByRole('option', { name: new RegExp(email) }).click();
  }

  private checkbox(label: string): Locator {
    return this.page.getByRole('checkbox', { name: label, exact: true });
  }

  private field(label: string): Locator {
    return this.page.getByLabel(label, { exact: true });
  }
}
