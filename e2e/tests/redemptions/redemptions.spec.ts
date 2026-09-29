import { expect, test } from '../../src/fixtures';

/**
 * Redemptions are the one thing the app never creates — a merchant's
 * integration posts them at checkout and every screen here only reads them
 * back. So each test arranges one through the API and then looks at what the
 * app makes of it.
 */
test.describe('Redemptions', () => {
  test('a fresh coupon code has none', async ({
    organization,
    couponCodePage,
    createCoupon,
    createCampaign,
    createCouponCode,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign);
    await couponCodePage.goto(
      organization.organizationId,
      coupon.couponId,
      campaign.campaignId,
      couponCode.couponCodeId,
    );

    await expect(couponCodePage.noRedemptions).toBeVisible();
  });

  test('the coupon code lists who redeemed it', async ({
    page,
    organization,
    couponCodePage,
    createCoupon,
    createCampaign,
    createCouponCode,
    createCustomer,
    createItem,
    redeem,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign);
    const customer = await createCustomer();
    const item = await createItem();
    await redeem(couponCode, { customer, item }, { baseOrderValue: 2000, discount: 200 });

    await couponCodePage.goto(
      organization.organizationId,
      coupon.couponId,
      campaign.campaignId,
      couponCode.couponCodeId,
    );

    await expect(page.getByText('Redemptions (1)')).toBeVisible();
    const redemption = couponCodePage.row(customer.email);
    await expect(redemption).toContainText(customer.name);
    // This table prints the discount as a bare number, unlike the dashboard's.
    await expect(redemption).toContainText('200');
  });

  test('searching the redemptions narrows them by email', async ({
    organization,
    couponCodePage,
    createCoupon,
    createCampaign,
    createCouponCode,
    createCustomer,
    createItem,
    redeem,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign);
    const item = await createItem();
    const wanted = await createCustomer({ email: 'wanted@example.com' });
    const other = await createCustomer({ email: 'somebody-else@example.com' });
    await redeem(couponCode, { customer: wanted, item });
    await redeem(couponCode, { customer: other, item });

    await couponCodePage.goto(
      organization.organizationId,
      coupon.couponId,
      campaign.campaignId,
      couponCode.couponCodeId,
    );
    await expect(couponCodePage.row(other.email)).toBeVisible();

    await couponCodePage.searchRedemptions('wanted@');

    await expect(couponCodePage.row(wanted.email)).toBeVisible();
    await expect(couponCodePage.row(other.email)).toHaveCount(0);
  });

  test('the coupon code page shows the code and who may use it', async ({
    page,
    organization,
    superAdmin,
    couponCodePage,
    createCoupon,
    createCampaign,
    createCouponCode,
    createCustomer,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign, {
      customerConstraint: 'specific',
      visibility: 'private',
      description: 'For our best customers',
      maxRedemptions: 25,
    });
    const customer = await createCustomer();
    await superAdmin.addCouponCodeCustomers(
      coupon.couponId,
      campaign.campaignId,
      couponCode.couponCodeId,
      [customer.customerId],
    );

    await couponCodePage.goto(
      organization.organizationId,
      coupon.couponId,
      campaign.campaignId,
      couponCode.couponCodeId,
    );

    await expect(page.getByText(couponCode.code).first()).toBeVisible();
    await expect(page.getByText('For our best customers')).toBeVisible();
    await expect(page.getByText('Private', { exact: true })).toBeVisible();
    await expect(page.getByText('Can be used by')).toBeVisible();
    await expect(page.getByText(customer.name, { exact: true })).toBeVisible();
    await expect(page.getByText('25', { exact: true })).toBeVisible();
  });
});

test.describe('The dashboard', () => {
  test('a new organization has nothing to report', async ({
    organization,
    dashboardPage,
  }) => {
    await dashboardPage.goto(organization.organizationId);

    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(dashboardPage.figure('Total redemptions')).toContainText('0');
  });

  test('a redemption turns up in the figures and the recent list', async ({
    organization,
    dashboardPage,
    createCoupon,
    createCampaign,
    createCouponCode,
    createCustomer,
    createItem,
    redeem,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign);
    const customer = await createCustomer();
    const item = await createItem();
    await redeem(couponCode, { customer, item }, { baseOrderValue: 5000, discount: 500 });

    await dashboardPage.goto(organization.organizationId);
    // Every figure comes from a summary the API refreshes on a timer.
    await dashboardPage.reloadUntilRow(couponCode.code);

    const redemption = dashboardPage.row(couponCode.code);
    await expect(redemption).toContainText(customer.name);
    await expect(redemption).toContainText(item.name);
    await expect(redemption).toContainText('₹5,000.00');
    await expect(redemption).toContainText('₹500.00');
    await expect(dashboardPage.figure('Total redemptions')).toContainText('1');
    await expect(dashboardPage.figure('Gross sales')).toContainText('₹5,000.00');
    await expect(dashboardPage.viewAllRedemptions).toBeVisible();
  });
});
