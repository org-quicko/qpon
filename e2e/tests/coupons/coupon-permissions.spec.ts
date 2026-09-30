import { expect, test, unique } from '../../src/fixtures';

const NOT_ALLOWED_REASON = 'Only editors and admins are allowed to edit, create or delete.';

test.describe('Viewer', () => {
  test.use({ role: 'viewer' });

  test('can browse the coupons', async ({ organization, couponsPage, createCoupon }) => {
    const coupon = await createCoupon({ discountValue: 30 });
    await couponsPage.goto(organization.organizationId);

    await expect(couponsPage.row(coupon.name)).toContainText('30%');
  });

  test('is told they cannot add coupons', async ({ page, organization, couponsPage }) => {
    await couponsPage.goto(organization.organizationId);

    await couponsPage.addCouponButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Action not allowed!');
    await expect(dialog).toContainText(NOT_ALLOWED_REASON);
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp('/home/coupons$'));
  });

  for (const action of ['Edit', 'Change status'] as const) {
    test(`is told they cannot ${action.toLowerCase()}`, async ({
      page,
      organization,
      couponsPage,
      createCoupon,
    }) => {
      const coupon = await createCoupon();
      await couponsPage.goto(organization.organizationId);

      await couponsPage.chooseRowAction(coupon.name, action);

      await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
      await page.getByRole('button', { name: 'Got it!' }).click();
      await expect(couponsPage.row(coupon.name)).toContainText('Active');
    });
  }

  test('is told they cannot add campaigns', async ({
    page,
    organization,
    couponPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();

    await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
    await page.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp(`/home/coupons/${coupon.couponId}$`));
  });

  test('is told they cannot add coupon codes', async ({
    page,
    organization,
    campaignPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();

    await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
    await page.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaign.campaignId}$`));
  });
});

test.describe('Editor', () => {
  test.use({ role: 'editor' });

  test('can add coupons', async ({ page, organization, couponsPage, couponWizard }) => {
    const name = unique('Editor coupon');
    await couponsPage.goto(organization.organizationId);

    await couponsPage.addCouponButton.click();
    await couponWizard.fillCoupon(name, 5);
    await couponWizard.nextButton.click();

    await expect(page.getByText('Coupon created successfully')).toBeVisible();
    await expect(page.getByText('Choose applicable items')).toBeVisible();
  });

  test('can add campaigns', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    const campaignName = unique('Editor campaign');
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();
    await couponWizard.campaignName.fill(campaignName);
    await couponWizard.saveButton.click();

    await expect(page.getByText('Campaign created successfully')).toBeVisible();
    await couponPage.reloadUntilRow(campaignName);
  });
});
