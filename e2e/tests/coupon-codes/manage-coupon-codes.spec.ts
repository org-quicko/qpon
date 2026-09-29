import { expect, test, uniqueSlug } from '../../src/fixtures';

/** Codes are upper-cased by the form, so arrange them that way too. */
const someCode = () => uniqueSlug('SAVE').toUpperCase();

test.describe('Managing coupon codes', () => {
  test('a new campaign has no coupon codes', async ({
    page,
    organization,
    campaignPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await expect(page.getByText('No coupon codes to show')).toBeVisible();
  });

  test('admin adds a public code that never expires', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const code = someCode();
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await expect(page.getByText('Craft your coupon code')).toBeVisible();
    await couponCodeWizard.code.fill(code);
    await couponCodeWizard.description.fill('Flat launch discount');
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validForever.click();
    await couponCodeWizard.continueTo('limits');

    await couponCodeWizard.setMinimumAmount.check();
    await couponCodeWizard.minimumAmount.fill('999');
    await couponCodeWizard.setMaxRedemptions.check();
    await couponCodeWizard.maxRedemptions.fill('50');
    await couponCodeWizard.continueTo('customers');

    await couponCodeWizard.everyone.click();
    await couponCodeWizard.continueTo('review');

    // The review screen is the last step, so its button saves.
    await expect(couponCodeWizard.pendingCode(code)).toBeVisible();
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon codes created')).toBeVisible();
    await campaignPage.whenReady();
    await expect(campaignPage.row(code)).toContainText('Public');
    await expect(campaignPage.row(code)).toContainText('Never');
    await expect(campaignPage.row(code)).toContainText('50');
    await expect(campaignPage.row(code)).toContainText('Active');
  });

  test('admin adds several codes in one go', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const first = someCode();
    const second = someCode();
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    for (const code of [first, second]) {
      await couponCodeWizard.code.fill(code);
      await couponCodeWizard.privateCode.click();
      await couponCodeWizard.validForever.click();
      await couponCodeWizard.continueTo('limits');
      await couponCodeWizard.continueTo('customers');
      await couponCodeWizard.everyone.click();
      await couponCodeWizard.continueTo('review');
      if (code === first) await couponCodeWizard.addAnotherCodeButton.click();
    }
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon codes created')).toBeVisible();
    await campaignPage.whenReady();
    await expect(campaignPage.row(first)).toContainText('Private');
    await expect(campaignPage.row(second)).toContainText('Private');
  });

  test('a code limited to specific customers names them', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
    createCustomer,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const customer = await createCustomer();
    const code = someCode();
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.code.fill(code);
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validForever.click();
    await couponCodeWizard.continueTo('limits');
    await couponCodeWizard.continueTo('customers');

    await couponCodeWizard.specificCustomers.click();
    await couponCodeWizard.chooseCustomer(customer.email);
    await couponCodeWizard.continueTo('review');

    // The review screen says who the code is for before anything is saved.
    await expect(page.getByText(`Limited to ${customer.name}`)).toBeVisible();
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon codes created')).toBeVisible();
    await campaignPage.whenReady();
    await expect(campaignPage.row(code)).toBeVisible();
  });

  test('a code that expires shows its date', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const code = someCode();
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.code.fill(code);
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validUntil.click();
    await couponCodeWizard.chooseExpiry(28);
    await couponCodeWizard.continueTo('limits');
    await couponCodeWizard.continueTo('customers');
    await couponCodeWizard.everyone.click();
    await couponCodeWizard.continueTo('review');
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon codes created')).toBeVisible();
    await campaignPage.whenReady();
    await expect(campaignPage.row(code)).not.toContainText('Never');
  });

  test('the code is required', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validForever.click();
    await couponCodeWizard.nextButton.click();

    await expect(page.getByText('Coupon code is required')).toBeVisible();
    await expect(page.getByText('Craft your coupon code')).toBeVisible();
  });

  test('visibility and validity have to be chosen', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.code.fill(someCode());
    await couponCodeWizard.nextButton.click();

    await expect(page.getByText('Visibility or Validity not selected')).toBeVisible();
    await expect(page.getByText('Craft your coupon code')).toBeVisible();
  });

  test('the form upper-cases what is typed', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.code.fill('shout-me');

    await expect(couponCodeWizard.code).toHaveValue('SHOUT-ME');
    await expect(page.getByText('Craft your coupon code')).toBeVisible();
  });

  test('a code can only be used once in an organization', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
    createCouponCode,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const existing = await createCouponCode(coupon, campaign);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.createCouponCodeButton.click();
    await couponCodeWizard.code.fill(existing.code);
    await couponCodeWizard.publicCode.click();
    await couponCodeWizard.validForever.click();
    await couponCodeWizard.continueTo('limits');
    await couponCodeWizard.continueTo('customers');
    await couponCodeWizard.everyone.click();
    await couponCodeWizard.continueTo('review');
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon code with this name already exists')).toBeVisible();
  });

  test('admin edits a code', async ({
    page,
    organization,
    campaignPage,
    couponCodeWizard,
    createCoupon,
    createCampaign,
    createCouponCode,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign, { visibility: 'public' });
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);

    await campaignPage.chooseRowAction(couponCode.code, 'Edit');
    await expect(page.getByText('Edit Coupon code details')).toBeVisible();
    await expect(couponCodeWizard.code).toHaveValue(couponCode.code);

    await couponCodeWizard.description.fill('Now with a description');
    await couponCodeWizard.privateCode.click();
    // Editing carries on to who may use the code, and saves that separately.
    await couponCodeWizard.continueTo('customers');
    await expect(page.getByText('Coupon code details updated')).toBeVisible();

    await couponCodeWizard.everyone.click();
    await couponCodeWizard.saveButton.click();

    await expect(page.getByText('Coupon code updated successfully')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/coupon-codes/${couponCode.couponCodeId}$`));
    await expect(page.getByText('Now with a description')).toBeVisible();
    await expect(page.getByText('Private', { exact: true })).toBeVisible();
  });

  test('admin deactivates a code', async ({
    page,
    organization,
    campaignPage,
    createCoupon,
    createCampaign,
    createCouponCode,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const couponCode = await createCouponCode(coupon, campaign);
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);
    await expect(campaignPage.row(couponCode.code)).toContainText('Active');

    await campaignPage.chooseRowAction(couponCode.code, 'Change status');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Deactivate '${couponCode.code}' coupon code?`);
    await dialog.getByRole('button', { name: 'Deactivate' }).click();

    await expect(dialog).toBeHidden();
    await expect(campaignPage.row(couponCode.code)).toContainText('Inactive');
  });

  test('an inactive campaign cannot take new codes', async ({
    page,
    organization,
    superAdmin,
    campaignPage,
    createCoupon,
    createCampaign,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    await superAdmin.deactivateCampaign(
      organization.organizationId,
      coupon.couponId,
      campaign.campaignId,
    );
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);
    // The page reads the status out of a summary that lags the change.
    await campaignPage.reloadUntilVisible(campaignPage.status('Inactive'));

    await campaignPage.createCouponCodeButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Campaign inactive!');
    await expect(dialog).toContainText(
      'You can’t create coupon code because the campaign is marked inactive.',
    );
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaign.campaignId}$`));
  });

  test('searching narrows the codes', async ({
    organization,
    campaignPage,
    createCoupon,
    createCampaign,
    createCouponCode,
  }) => {
    const coupon = await createCoupon();
    const campaign = await createCampaign(coupon);
    const wanted = await createCouponCode(coupon, campaign, { code: 'WANTED-ONE' });
    const other = await createCouponCode(coupon, campaign, { code: 'SOMETHING-ELSE' });
    await campaignPage.goto(organization.organizationId, coupon.couponId, campaign.campaignId);
    await expect(campaignPage.row(other.code)).toBeVisible();

    await campaignPage.search('WANTED');

    await expect(campaignPage.row(wanted.code)).toBeVisible();
    await expect(campaignPage.row(other.code)).toHaveCount(0);
  });
});
