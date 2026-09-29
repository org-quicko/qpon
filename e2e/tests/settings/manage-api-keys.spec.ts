import { expect, test } from '../../src/fixtures';

test.describe('Managing the API key', () => {
  test('a new organization has no API key', async ({
    page,
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'API Keys');

    await expect(page.getByText('No API Key Generated')).toBeVisible();
    await expect(settingsPage.generateApiKeyButton).toBeVisible();
    await expect(settingsPage.regenerateApiKeyButton).toHaveCount(0);
  });

  test('admin generates the first key', async ({ page, organization, settingsPage }) => {
    await settingsPage.goto(organization.organizationId, 'API Keys');

    await settingsPage.generateApiKeyButton.click();

    await expect(page.getByText('API key generated successfully')).toBeVisible();
    // The secret is shown once, here, and never again.
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('API Credentials');
    await expect(dialog).toContainText('Secret Key');
    await expect(dialog).toContainText("Save this secret key now. You won't be able to see it again!");

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(settingsPage.regenerateApiKeyButton).toBeVisible();
  });

  test('the key is shown on the page but the secret is not', async ({
    page,
    organization,
    superAdmin,
    settingsPage,
  }) => {
    const apiKey = await superAdmin.createApiKey(organization.organizationId);
    await settingsPage.goto(organization.organizationId, 'API Keys');

    await expect(page.getByText(apiKey.key)).toBeVisible();
    await expect(page.getByText('Generated at')).toBeVisible();
    await expect(page.getByText(apiKey.secret)).toHaveCount(0);
  });

  test('admin regenerates the key after confirming', async ({
    page,
    organization,
    superAdmin,
    settingsPage,
  }) => {
    const old = await superAdmin.createApiKey(organization.organizationId);
    await settingsPage.goto(organization.organizationId, 'API Keys');
    await expect(page.getByText(old.key)).toBeVisible();

    await settingsPage.regenerateApiKeyButton.click();
    const confirm = page.getByRole('dialog');
    await expect(confirm).toContainText('Regenerate API Key?');
    await confirm.getByRole('button', { name: 'Regenerate' }).click();

    await expect(page.getByText('API key generated successfully')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText(old.key)).toHaveCount(0);
  });

  test('cancelling the regeneration keeps the key', async ({
    page,
    organization,
    superAdmin,
    settingsPage,
  }) => {
    const apiKey = await superAdmin.createApiKey(organization.organizationId);
    await settingsPage.goto(organization.organizationId, 'API Keys');

    await settingsPage.regenerateApiKeyButton.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(apiKey.key)).toBeVisible();
  });
});

for (const role of ['editor', 'viewer'] as const) {
  test.describe(`${role[0].toUpperCase()}${role.slice(1)}`, () => {
    test.use({ role });

    test('is told they cannot generate a key', async ({
      page,
      organization,
      settingsPage,
    }) => {
      await settingsPage.goto(organization.organizationId, 'API Keys');

      await settingsPage.generateApiKeyButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toContainText('Action not allowed!');
      await expect(dialog).toContainText(
        'You do not have permission to Generate an API key.',
      );
      await dialog.getByRole('button', { name: 'Got it!' }).click();
      await expect(page.getByText('No API Key Generated')).toBeVisible();
    });
  });
}
