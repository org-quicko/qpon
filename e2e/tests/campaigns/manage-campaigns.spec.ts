import { expect, test, unique } from '../../src/fixtures';

test.describe('Managing campaigns', () => {
  test('a new coupon has no campaigns', async ({
    page,
    organization,
    couponPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await expect(page.getByText('No campaigns to show')).toBeVisible();
  });

  test('admin adds a campaign with a limited budget', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    const campaignName = unique('Launch week');
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();
    await expect(page.getByText('Let’s create a campaign')).toBeVisible();
    await couponWizard.campaignName.fill(campaignName);
    await couponWizard.limitedBudget.click();
    await couponWizard.budgetAmount.fill('25000');
    await couponWizard.saveButton.click();

    await expect(page.getByText('Campaign created successfully')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/home/coupons/${coupon.couponId}$`));
    await couponPage.reloadUntilRow(campaignName);
    await expect(couponPage.row(campaignName)).toContainText('₹25,000.00');
    await expect(couponPage.row(campaignName)).toContainText('Active');
  });

  test('a campaign on an unlimited budget says so', async ({
    organization,
    couponPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.reloadUntilRow(campaign.name);
    await expect(couponPage.row(campaign.name)).toContainText('Unlimited');
  });

  test('a campaign needs a name', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();
    await couponWizard.saveButton.click();

    await expect(page.getByText('Campaign name is required')).toBeVisible();
    await expect(page.getByText('Let’s create a campaign')).toBeVisible();
  });

  test('a limited budget needs an amount', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();
    await couponWizard.campaignName.fill(unique('No budget'));
    await couponWizard.limitedBudget.click();
    await couponWizard.saveButton.click();

    await expect(page.getByText('Budget amount is required for limited budget')).toBeVisible();
  });

  test('a campaign name can only be used once under a coupon', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const existing = await createCampaign(coupon);
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();
    // Names are compared case-insensitively.
    await couponWizard.campaignName.fill(existing.name.toUpperCase());
    await couponWizard.saveButton.click();

    await expect(page.getByText('Campaign with this name already exists')).toBeVisible();
  });

  test('admin renames a campaign', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon, { budget: 5000 });
    const renamed = unique('Renamed campaign');
    await couponPage.goto(organization.organizationId, coupon.couponId);
    await couponPage.reloadUntilRow(campaign.name);

    await couponPage.chooseRowAction(campaign.name, 'Edit');
    await expect(page.getByText('Edit campaign details')).toBeVisible();
    await expect(couponWizard.campaignName).toHaveValue(campaign.name);

    await couponWizard.campaignName.fill(renamed);
    await couponWizard.saveButton.click();

    await expect(page.getByText('Campaign updated successfully')).toBeVisible();
    await couponPage.reloadUntilRow(renamed);
    await expect(couponPage.row(campaign.name)).toHaveCount(0);
  });

  test('admin deactivates a campaign', async ({
    page,
    organization,
    couponPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await couponPage.goto(organization.organizationId, coupon.couponId);
    await couponPage.reloadUntilRow(campaign.name);

    await couponPage.chooseRowAction(campaign.name, 'Change status');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Deactivate '${campaign.name}' campaign?`);
    await dialog.getByRole('button', { name: 'Deactivate' }).click();

    await expect(dialog).toBeHidden();
    await couponPage.reloadUntilRow(campaign.name, 'Inactive');
  });

  test('an inactive coupon cannot take new campaigns', async ({
    page,
    organization,
    superAdmin,
    couponPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon();
    await superAdmin.deactivateCoupon(organization.organizationId, coupon.couponId);
    await couponPage.goto(organization.organizationId, coupon.couponId);

    await couponPage.createCampaignButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Coupon inactive!');
    await expect(dialog).toContainText(
      'You can’t create campaign because the coupon is marked inactive.',
    );
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp(`/home/coupons/${coupon.couponId}$`));
  });

  test('opening a row shows the campaign', async ({
    page,
    organization,
    couponPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon, { budget: 1000 });
    await couponPage.goto(organization.organizationId, coupon.couponId);
    await couponPage.reloadUntilRow(campaign.name);

    await couponPage.row(campaign.name).click();

    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaign.campaignId}$`));
    await expect(page.getByRole('button', { name: 'Create coupon code' })).toBeVisible();
  });

  test('searching narrows the campaigns by name', async ({
    organization,
    couponPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const spring = await createCampaign(coupon, { name: unique('Spring') });
    const autumn = await createCampaign(coupon, { name: unique('Autumn') });
    await couponPage.goto(organization.organizationId, coupon.couponId);
    await couponPage.reloadUntilRow(autumn.name);

    await couponPage.search('spring');

    await expect(couponPage.row(spring.name)).toBeVisible();
    await expect(couponPage.row(autumn.name)).toHaveCount(0);
  });
});
