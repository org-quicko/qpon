import { expect, test, unique, uniqueSlug } from '../../src/fixtures';

test.describe('Managing coupons', () => {
  test('a new organization has no coupons', async ({ organization, couponsPage }) => {
    await couponsPage.goto(organization.organizationId);

    await expect(couponsPage.emptyState).toBeVisible();
    await expect(couponsPage.searchBox).toBeHidden();
  });

  test('admin creates a coupon, a campaign and a code in one pass', async ({
    page,
    organization,
    couponsPage,
    couponWizard,
    couponCodeWizard,
  }) => {
    const couponName = unique('Diwali Sale');
    const campaignName = unique('Week one');
    const code = uniqueSlug('DIWALI').toUpperCase();
    await couponsPage.goto(organization.organizationId);

    // Step 1 — the coupon. Each step saves as you leave it.
    await couponsPage.addCouponButton.click();
    await expect(page.getByText('Let’s create a new coupon')).toBeVisible();
    await couponWizard.fillCoupon(couponName, 20);
    await couponWizard.setMaxAmount.click();
    await couponWizard.maxAmount.fill('500');
    await couponWizard.nextButton.click();
    await expect(page.getByText('Coupon created successfully')).toBeVisible();

    // Step 2 — what it applies to, which starts on "All items".
    await expect(page.getByText('Choose applicable items')).toBeVisible();
    await couponWizard.nextButton.click();

    // Step 3 — the first campaign, on an unlimited budget by default.
    await expect(page.getByText('Let’s create a campaign')).toBeVisible();
    await couponWizard.campaignName.fill(campaignName);
    await couponWizard.nextButton.click();
    await expect(page.getByText('Campaign created successfully')).toBeVisible();

    // Step 4 — the first coupon code, over three screens then a review.
    await expect(couponCodeWizard.heading.code).toBeVisible();
    await couponCodeWizard.code.fill(code);
    await couponCodeWizard.description.fill('20% off, capped at ₹500');
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validForever.click();
    await couponCodeWizard.continueTo('limits');

    await couponCodeWizard.setMaxRedemptions.check();
    await couponCodeWizard.maxRedemptions.fill('100');
    await couponCodeWizard.continueTo('customers');

    await couponCodeWizard.everyone.click();
    await couponCodeWizard.continueTo('review');

    // The review screen saves every code entered so far. In this flow the
    // button keeps reading "Next" even though it is the last step.
    await expect(couponCodeWizard.pendingCode(code)).toBeVisible();
    await couponCodeWizard.nextButton.click();

    // Which lands on the campaign the code belongs to.
    await expect(page.getByText('Coupon codes created')).toBeVisible();
    await expect(page).toHaveURL(/\/home\/coupons\/[^/]+\/campaigns\/[^/]+$/);
    await expect(page.getByRole('row').filter({ hasText: code })).toContainText('Public');
    await expect(page.getByRole('row').filter({ hasText: code })).toContainText('100');
  });

  test('the coupon list shows the discount and what it applies to', async ({
    organization,
    couponsPage,
    createCoupon,
  }) => {
    const capped = await createCoupon({ discountValue: 15, discountUpto: 750 });
    const flat = await createCoupon({ discountType: 'fixed', discountValue: 200 });
    await couponsPage.goto(organization.organizationId);

    await expect(couponsPage.row(capped.name)).toContainText('15% upto ₹750.00');
    await expect(couponsPage.row(capped.name)).toContainText('All products');
    await expect(couponsPage.row(capped.name)).toContainText('Active');
    await expect(couponsPage.row(flat.name)).toContainText('₹200.00');
  });

  test('a coupon needs a name and a discount', async ({
    page,
    organization,
    couponsPage,
    couponWizard,
  }) => {
    await couponsPage.goto(organization.organizationId);

    await couponsPage.addCouponButton.click();
    await couponWizard.nextButton.click();

    await expect(page.getByText('Coupon name is required')).toBeVisible();
    await expect(page.getByText('Let’s create a new coupon')).toBeVisible();
  });

  test('a percentage discount cannot go over 100', async ({
    page,
    organization,
    couponsPage,
    couponWizard,
  }) => {
    await couponsPage.goto(organization.organizationId);

    await couponsPage.addCouponButton.click();
    await couponWizard.fillCoupon(unique('Too generous'), 150);
    await couponWizard.nextButton.click();

    await expect(page.getByText('Value should be between 0 to 100')).toBeVisible();
    await expect(page.getByText('Let’s create a new coupon')).toBeVisible();
  });

  test('a coupon name can only be used once', async ({
    page,
    organization,
    couponsPage,
    couponWizard,
    createCoupon,
  }) => {
    const existing = await createCoupon();
    await couponsPage.goto(organization.organizationId);

    await couponsPage.addCouponButton.click();
    // Names are compared case-insensitively.
    await couponWizard.fillCoupon(existing.name.toUpperCase(), 10);
    await couponWizard.nextButton.click();

    await expect(page.getByText('Coupon with this name already exists')).toBeVisible();
  });

  test('admin renames a coupon', async ({
    page,
    organization,
    couponsPage,
    couponWizard,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    const renamed = unique('Renamed coupon');
    await couponsPage.goto(organization.organizationId);

    await couponsPage.chooseRowAction(coupon.name, 'Edit');
    await expect(page.getByText('Edit your coupon')).toBeVisible();
    await expect(couponWizard.name).toHaveValue(coupon.name);

    await couponWizard.name.fill(renamed);
    await couponWizard.saveButton.click();

    // Editing returns to wherever it was opened from.
    await couponsPage.whenReady();
    await expect(couponsPage.row(renamed)).toBeVisible();
    await expect(couponsPage.row(coupon.name)).toHaveCount(0);
  });

  test('admin deactivates a coupon from the list', async ({
    page,
    organization,
    couponsPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponsPage.goto(organization.organizationId);
    await expect(couponsPage.row(coupon.name)).toContainText('Active');

    await couponsPage.chooseRowAction(coupon.name, 'Change status');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Mark coupon as inactive?');
    await dialog.getByRole('button', { name: 'Confirm' }).click();

    await expect(dialog).toBeHidden();
    await expect(couponsPage.row(coupon.name)).toContainText('Inactive');
  });

  test('opening a row shows the coupon', async ({
    page,
    organization,
    couponsPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon({ discountValue: 25 });
    await couponsPage.goto(organization.organizationId);

    await couponsPage.row(coupon.name).click();

    await expect(page).toHaveURL(new RegExp(`/home/coupons/${coupon.couponId}$`));
    await expect(page.getByText('25% discount')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Campaigns' })).toBeVisible();
  });

  test('admin deletes a coupon from its own page', async ({
    page,
    organization,
    couponsPage,
    couponPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.chooseCouponAction('Delete');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Delete ‘${coupon.name}’ coupon?`);
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page).toHaveURL(new RegExp('/home/coupons$'));
    await expect(couponsPage.emptyState).toBeVisible();
  });

  test('searching narrows the list by name', async ({
    organization,
    couponsPage,
    createCoupon,
  }) => {
    const summer = await createCoupon({ name: unique('Summer') });
    const winter = await createCoupon({ name: unique('Winter') });
    await couponsPage.goto(organization.organizationId);
    await expect(couponsPage.row(winter.name)).toBeVisible();

    await couponsPage.search('summer');

    await expect(couponsPage.row(summer.name)).toBeVisible();
    await expect(couponsPage.row(winter.name)).toHaveCount(0);
  });
});
