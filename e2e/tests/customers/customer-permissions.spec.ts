import { expect, test, unique, uniqueSlug } from '../../src/fixtures';

const NOT_ALLOWED_REASON = 'Only editors and admins are allowed to edit, create or delete.';

test.describe('Viewer', () => {
  test.use({ role: 'viewer' });

  test('can browse the customers', async ({ organization, customersPage, createCustomer }) => {
    const customer = await createCustomer();
    await customersPage.goto(organization.organizationId);

    await expect(customersPage.row(customer.name)).toContainText(customer.email);
  });

  test('is told they cannot add customers', async ({ page, organization, customersPage }) => {
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Action not allowed!');
    await expect(dialog).toContainText(NOT_ALLOWED_REASON);
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp('/home/customers$'));
  });

  for (const action of ['Edit', 'Delete'] as const) {
    test(`is told they cannot ${action.toLowerCase()} customers`, async ({
      page,
      organization,
      customersPage,
      createCustomer,
    }) => {
      const customer = await createCustomer();
      await customersPage.goto(organization.organizationId);

      await customersPage.chooseRowAction(customer.name, action);

      await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
      await page.getByRole('button', { name: 'Got it!' }).click();
      await expect(customersPage.row(customer.name)).toBeVisible();
    });
  }
});

test.describe('Editor', () => {
  test.use({ role: 'editor' });

  test('can add customers', async ({ page, organization, customersPage, customerWizard }) => {
    const name = unique('Editor customer');
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.fill({
      name,
      email: `${uniqueSlug('editor')}@example.com`,
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customers created successfully')).toBeVisible();
    await expect(customersPage.row(name)).toBeVisible();
  });
});
