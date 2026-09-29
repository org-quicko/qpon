import { expect, test, unique, uniqueSlug } from '../../src/fixtures';

test.describe('Managing customers', () => {
  test('a new organization has no customers', async ({ organization, customersPage }) => {
    await customersPage.goto(organization.organizationId);

    await expect(customersPage.emptyState).toBeVisible();
    await expect(customersPage.searchBox).toBeHidden();
  });

  test('admin adds a customer', async ({
    page,
    organization,
    customersPage,
    customerWizard,
  }) => {
    const name = unique('Priya Sharma');
    const email = `${uniqueSlug('priya')}@example.com`;
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await expect(page.getByText('Add a new customer')).toBeVisible();
    await customerWizard.fill({
      name,
      email,
      phone: '9876543210',
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();

    // The flow lists what is about to be saved before anything is created.
    await expect(page.getByText('Add another customer')).toBeVisible();
    await expect(customerWizard.pendingCustomer(name)).toContainText(email);
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customers created successfully')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${organization.organizationId}/home/customers$`));
    await expect(customersPage.row(name)).toContainText(email);
    // The form has no country-code field, so the number shows on its own.
    await expect(customersPage.row(name)).toContainText('9876543210');
    await expect(page.getByText('Customers (1)')).toBeVisible();
  });

  test('a customer without a phone number shows N/A', async ({
    page,
    organization,
    customersPage,
    customerWizard,
  }) => {
    const name = unique('No Phone');
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.fill({
      name,
      email: `${uniqueSlug('nophone')}@example.com`,
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customers created successfully')).toBeVisible();
    await expect(customersPage.row(name)).toContainText('N/A');
  });

  test('admin adds several customers in one go', async ({
    page,
    organization,
    customersPage,
    customerWizard,
  }) => {
    const first = unique('Anil');
    const second = unique('Bhavna');
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.fill({
      name: first,
      email: `${uniqueSlug('anil')}@example.com`,
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();
    await customerWizard.addMoreButton.click();
    await customerWizard.fill({
      name: second,
      email: `${uniqueSlug('bhavna')}@example.com`,
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customers created successfully')).toBeVisible();
    await expect(customersPage.row(first)).toBeVisible();
    await expect(customersPage.row(second)).toBeVisible();
    await expect(page.getByText('Customers (2)')).toBeVisible();
  });

  test('name, email and external id are required', async ({
    page,
    organization,
    customersPage,
    customerWizard,
  }) => {
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.nextButton.click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('External id is required')).toBeVisible();
    await expect(page.getByText('Add a new customer')).toBeVisible();
  });

  test('the email has to look like an email', async ({
    page,
    organization,
    customersPage,
    customerWizard,
  }) => {
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.fill({
      name: unique('Typo'),
      email: 'not-an-email',
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();

    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('Add a new customer')).toBeVisible();
  });

  test('an email can only be used once', async ({
    page,
    organization,
    customersPage,
    customerWizard,
    createCustomer,
  }) => {
    const existing = await createCustomer();
    await customersPage.goto(organization.organizationId);

    await customersPage.addCustomerButton.click();
    await customerWizard.fill({
      name: unique('Impostor'),
      email: existing.email,
      externalId: uniqueSlug('CRM'),
    });
    await customerWizard.nextButton.click();
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customer already exists')).toBeVisible();
  });

  test('admin edits a customer', async ({
    page,
    organization,
    customersPage,
    customerWizard,
    createCustomer,
  }) => {
    const customer = await createCustomer();
    const renamed = unique('Renamed customer');
    const newEmail = `${uniqueSlug('renamed')}@example.com`;
    await customersPage.goto(organization.organizationId);

    await customersPage.chooseRowAction(customer.name, 'Edit');
    await expect(page.getByText('Edit customer details')).toBeVisible();
    // The form opens pre-filled with what is saved.
    await expect(customerWizard.name).toHaveValue(customer.name);
    await expect(customerWizard.email).toHaveValue(customer.email);
    await expect(customerWizard.externalId).toHaveValue(customer.externalId);

    await customerWizard.fill({ name: renamed, email: newEmail });
    await customerWizard.saveButton.click();

    await expect(page.getByText('Customer updated successfully')).toBeVisible();
    await expect(customersPage.row(renamed)).toContainText(newEmail);
    await expect(customersPage.row(customer.name)).toHaveCount(0);
  });

  test('admin deletes a customer after confirming', async ({
    page,
    organization,
    customersPage,
    createCustomer,
  }) => {
    const customer = await createCustomer();
    await customersPage.goto(organization.organizationId);

    await customersPage.chooseRowAction(customer.name, 'Delete');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Delete ${customer.name}?`);
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(dialog).toBeHidden();
    await expect(customersPage.emptyState).toBeVisible();
  });

  test('cancelling the delete keeps the customer', async ({
    page,
    organization,
    customersPage,
    createCustomer,
  }) => {
    const customer = await createCustomer();
    await customersPage.goto(organization.organizationId);

    await customersPage.chooseRowAction(customer.name, 'Delete');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await page.reload();
    await expect(customersPage.row(customer.name)).toBeVisible();
  });

  test('searching narrows the list by email', async ({
    organization,
    customersPage,
    createCustomer,
  }) => {
    const wanted = await createCustomer({ email: 'wanted@example.com' });
    const other = await createCustomer({ email: 'somebody-else@example.com' });
    await customersPage.goto(organization.organizationId);
    await expect(customersPage.row(other.name)).toBeVisible();

    await customersPage.search('wanted@');

    await expect(customersPage.row(wanted.name)).toBeVisible();
    await expect(customersPage.row(other.name)).toHaveCount(0);
  });
});
