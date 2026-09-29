import { expect, test, unique } from '../../src/fixtures';

const NOT_ALLOWED_REASON = 'Only editors and admins are allowed to edit, create or delete.';

test.describe('Managing a coupon’s eligible items', () => {
  test('a coupon on all items says so', async ({
    page,
    organization,
    couponPage,
    createCoupon,
  }) => {
    const coupon = await createCoupon({ itemConstraint: 'all' });
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await expect(page.getByText('Coupon is eligible on all items')).toBeVisible();
    // With nothing to narrow, the only thing on offer is to change that.
    await expect(couponPage.editEligibleItemsButton).toBeVisible();
    await expect(couponPage.addEligibleItemsButton).toHaveCount(0);
  });

  test('a coupon on specific items lists them', async ({
    organization,
    superAdmin,
    couponPage,
    createCoupon,
    createItem,
  }) => {
    const item = await createItem({ description: 'The one it applies to' });
    const other = await createItem();
    const coupon = await createCoupon();
    await superAdmin.restrictCouponToItems(organization.organizationId, coupon.couponId, [
      item.itemId,
    ]);
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await expect(couponPage.row(item.name)).toContainText('The one it applies to');
    await expect(couponPage.row(other.name)).toHaveCount(0);
  });

  test('admin narrows a coupon to specific items', async ({
    page,
    organization,
    couponPage,
    couponWizard,
    createCoupon,
    createItem,
  }) => {
    const item = await createItem({ name: unique('Eligible item') });
    const coupon = await createCoupon({ itemConstraint: 'all' });
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await couponPage.editEligibleItemsButton.click();
    await expect(page.getByText('Choose applicable items')).toBeVisible();
    // The screen resets the choice to whatever the coupon says once it has
    // loaded, and it names the coupon when it has — so wait for that first.
    await expect(page.getByText(coupon.name, { exact: true })).toBeVisible();
    await couponWizard.specificItems.click();
    await couponWizard.chooseItem(item.name);
    await couponWizard.saveButton.click();

    // Editing returns to the coupon it was opened from.
    await couponPage.whenReady();
    await couponPage.eligibleItemsTab.click();
    await expect(couponPage.row(item.name)).toBeVisible();
  });

  test('admin removes an item from a coupon', async ({
    page,
    organization,
    superAdmin,
    couponPage,
    createCoupon,
    createItem,
  }) => {
    const [kept, dropped] = [await createItem(), await createItem()];
    const coupon = await createCoupon();
    await superAdmin.restrictCouponToItems(organization.organizationId, coupon.couponId, [
      kept.itemId,
      dropped.itemId,
    ]);
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await couponPage.chooseRowAction(dropped.name, 'Remove');

    await expect(page.getByText('Item deleted successfully')).toBeVisible();
    await expect(couponPage.row(dropped.name)).toHaveCount(0);
    await expect(couponPage.row(kept.name)).toBeVisible();
  });

  test('searching narrows the eligible items', async ({
    organization,
    superAdmin,
    couponPage,
    createCoupon,
    createItem,
  }) => {
    const shirt = await createItem({ name: unique('Shirt') });
    const shoes = await createItem({ name: unique('Shoes') });
    const coupon = await createCoupon();
    await superAdmin.restrictCouponToItems(organization.organizationId, coupon.couponId, [
      shirt.itemId,
      shoes.itemId,
    ]);
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);
    await expect(couponPage.row(shoes.name)).toBeVisible();

    await couponPage.searchEligibleItems(shirt.name);

    await expect(couponPage.row(shirt.name)).toBeVisible();
    await expect(couponPage.row(shoes.name)).toHaveCount(0);
  });
});

test.describe('Viewer', () => {
  test.use({ role: 'viewer' });

  test('can see the eligible items', async ({
    organization,
    superAdmin,
    couponPage,
    createCoupon,
    createItem,
  }) => {
    const item = await createItem();
    const coupon = await createCoupon();
    await superAdmin.restrictCouponToItems(organization.organizationId, coupon.couponId, [
      item.itemId,
    ]);
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await expect(couponPage.row(item.name)).toBeVisible();
  });

  test('is told they cannot change them', async ({
    page,
    organization,
    superAdmin,
    couponPage,
    createCoupon,
    createItem,
  }) => {
    const item = await createItem();
    const coupon = await createCoupon();
    await superAdmin.restrictCouponToItems(organization.organizationId, coupon.couponId, [
      item.itemId,
    ]);
    await couponPage.gotoEligibleItems(organization.organizationId, coupon.couponId);

    await couponPage.chooseRowAction(item.name, 'Remove');

    await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
    await page.getByRole('button', { name: 'Got it!' }).click();
    await expect(couponPage.row(item.name)).toBeVisible();
  });
});
