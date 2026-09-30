import { expect, test, unique } from '../../src/fixtures';

test.describe('The organization’s own settings', () => {
  test('the organisation tab names the organization', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Organisation');

    await expect(page.getByText('Organisation name')).toBeVisible();
    // The header carries the name too, so it shows twice.
    await expect(page.getByText(organization.name, { exact: true }).first()).toBeVisible();
  });

  test('not even an admin may rename the organization', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Organisation');

    await settingsPage.editOrganizationNameButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Action not allowed!');
    await expect(dialog).toContainText(
      'You do not have permission to edit organisation details.',
    );
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page.getByText(organization.name, { exact: true }).first()).toBeVisible();
  });

  test('not even an admin may delete the organization', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Organisation');

    await settingsPage.deleteOrganizationButton.click();

    // Deleting an organization is a super admin's to do, and they never reach
    // this page — it is the organization they are signed into that it deletes.
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Action not allowed!');
    await expect(dialog).toContainText('You do not have permission to delete organisation.');
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp('/home/settings$'));
  });
});

test.describe('Viewer', () => {
  test.use({ role: 'viewer' });

  test('can see the organization but not rename it', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Organisation');
    await expect(page.getByText(organization.name, { exact: true }).first()).toBeVisible();

    await settingsPage.editOrganizationNameButton.click();

    await expect(page.getByRole('dialog')).toContainText(
      'You do not have permission to edit organisation details.',
    );
  });
});

test.describe('Super admin', () => {
  test.use({ role: 'super_admin' });

  test('is refused a delete while the organization still has active coupons', async ({
    page,
    organization,
    settingsPage,
    createCoupon,
  }) => {
    await createCoupon();
    await settingsPage.goto(organization.organizationId, 'Organisation');

    await settingsPage.deleteOrganizationButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Delete organisation?');
    await dialog.getByRole('button', { name: 'Delete' }).click();

    // The API counts what is still switched on and says what to do about it,
    // rather than the bare "Failed to delete organization" this used to show.
    await expect(
      page.getByText(
        'Organization has 1 active coupon(s). ' +
          'Deactivate them before deleting the organization.',
      ),
    ).toBeVisible();
    // Nothing was deleted, so the confirmation is still standing.
    await expect(dialog).toContainText('Delete organisation?');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText(organization.name, { exact: true }).first()).toBeVisible();
  });

  test('may rename the organization', async ({ page, organization, settingsPage }) => {
    const renamed = unique('Renamed org');
    await settingsPage.goto(organization.organizationId, 'Organisation');

    await settingsPage.editOrganizationNameButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Organisation Name')).toHaveValue(organization.name);
    await dialog.getByLabel('Organisation Name').fill(renamed);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(renamed, { exact: true }).first()).toBeVisible();
  });
});

test.describe('The organization picker', () => {
  test('lists the organizations you belong to', async ({
    page,
    organization,
    organizationsPage,
  }) => {
    await organizationsPage.goto();

    await expect(organizationsPage.heading).toBeVisible();
    await expect(organizationsPage.organization(organization.name)).toBeVisible();
    await expect(page.getByText('You are the admin').first()).toBeVisible();
  });

  test('opening one lands on its dashboard', async ({
    page,
    organization,
    organizationsPage,
    dashboardPage,
  }) => {
    await organizationsPage.goto();

    await organizationsPage.organization(organization.name).click();

    await expect(page).toHaveURL(new RegExp(`/${organization.organizationId}/home/dashboard$`));
    await dashboardPage.whenReady();
  });
});
