import { credentials } from '../../src/env';
import { expect, test } from '../../src/fixtures';

/**
 * The member accounts are shared by the whole suite, so nothing here submits
 * this form — a renamed or re-passworded `e2e-admin@` would break every other
 * test, on this run and the next, and one lost race is all that would take.
 * The validation it shares with every other form dialog is covered on the
 * organization's copy, where a stray save stays inside the test's own data.
 */
test.describe('Your own profile', () => {
  test('the profile tab shows who you are signed in as', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Profile');

    await expect(page.getByText(credentials.members.admin.email)).toBeVisible();
    await expect(page.getByText(credentials.members.admin.name)).toBeVisible();
  });

  test('the form opens on what is saved', async ({ page, organization, settingsPage }) => {
    await settingsPage.goto(organization.organizationId, 'Profile');

    await settingsPage.editProfileButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Edit Profile');
    await expect(dialog.getByLabel('Email')).toHaveValue(credentials.members.admin.email);
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      credentials.members.admin.name,
    );
    // The password fields start empty; leaving them alone keeps the password.
    await expect(dialog.getByLabel('Current password')).toHaveValue('');
    await expect(dialog.getByLabel('New password')).toHaveValue('');
  });

  test('cancelling leaves the profile alone', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Profile');

    await settingsPage.editProfileButton.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name', { exact: true }).fill('Someone Else');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(credentials.members.admin.name)).toBeVisible();
  });
});
