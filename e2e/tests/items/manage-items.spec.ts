import { expect, test, unique } from '../../src/fixtures';

test.describe('Managing items', () => {
  test('a new organization shows an empty catalogue', async ({ organization, itemsPage }) => {
    await itemsPage.goto(organization.organizationId);

    await expect(itemsPage.emptyState).toBeVisible();
    await expect(itemsPage.searchBox).toBeHidden();
  });

  test('admin adds an item to the catalogue', async ({ page, organization, itemsPage, itemForm }) => {
    const name = unique('Wireless Mouse');
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();
    await expect(page.getByText('Add a new item')).toBeVisible();
    await itemForm.fill({ name, description: 'Ergonomic, 2.4 GHz', externalId: 'SKU-MOUSE-1' });
    await itemForm.nextButton.click();

    // The wizard lists what's about to be saved before anything is created.
    await expect(page.getByText('Add another item')).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
    await itemForm.saveButton.click();

    await expect(page.getByText('Items created successfully')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${organization.organizationId}/home/items$`));
    await expect(itemsPage.row(name)).toContainText('Ergonomic, 2.4 GHz');
    await expect(page.getByText('Items (1)')).toBeVisible();
  });

  test('admin adds several items in one go', async ({ page, organization, itemsPage, itemForm }) => {
    const first = unique('Keyboard');
    const second = unique('Monitor');
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();
    await itemForm.fill({ name: first, externalId: 'SKU-KB-1' });
    await itemForm.nextButton.click();
    await itemForm.addMoreButton.click();
    await itemForm.fill({ name: second, externalId: 'SKU-MON-1' });
    await itemForm.nextButton.click();
    await itemForm.saveButton.click();

    await expect(page.getByText('Items created successfully')).toBeVisible();
    await expect(itemsPage.row(first)).toBeVisible();
    await expect(itemsPage.row(second)).toBeVisible();
    await expect(page.getByText('Items (2)')).toBeVisible();
  });

  test('name and external id are required', async ({ page, organization, itemsPage, itemForm }) => {
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();
    await itemForm.nextButton.click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('External Id is required')).toBeVisible();
    await expect(page.getByText('Add a new item')).toBeVisible();
  });

  test('an item name can only be used once', async ({ page, organization, itemsPage, itemForm, createItem }) => {
    const existing = await createItem();
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();
    // Names are compared case-insensitively.
    await itemForm.fill({ name: existing.name.toUpperCase(), externalId: 'SKU-DUPLICATE' });
    await itemForm.nextButton.click();
    await itemForm.saveButton.click();

    await expect(page.getByText('Item already exists')).toBeVisible();
  });

  test('admin edits an item', async ({ page, organization, itemsPage, itemForm, createItem }) => {
    const item = await createItem({ description: 'Old description' });
    const renamed = unique('Renamed item');
    await itemsPage.goto(organization.organizationId);

    await itemsPage.chooseRowAction(item.name, 'Edit');
    await expect(page.getByText('Edit item')).toBeVisible();
    // The form opens pre-filled with what's saved.
    await expect(itemForm.name).toHaveValue(item.name);
    await expect(itemForm.externalId).toHaveValue(item.externalId);

    await itemForm.fill({ name: renamed, description: 'New description' });
    await itemForm.saveButton.click();

    await expect(page.getByText('Item updated successfully')).toBeVisible();
    await expect(itemsPage.row(renamed)).toContainText('New description');
    await expect(itemsPage.row(item.name)).toHaveCount(0);
  });

  test('admin deletes an item after confirming', async ({ page, organization, itemsPage, createItem }) => {
    const item = await createItem();
    await itemsPage.goto(organization.organizationId);

    await itemsPage.chooseRowAction(item.name, 'Delete');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Delete ${item.name}?`);
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(dialog).toBeHidden();
    await expect(itemsPage.emptyState).toBeVisible();
  });

  test('cancelling the delete keeps the item', async ({ page, organization, itemsPage, createItem }) => {
    const item = await createItem();
    await itemsPage.goto(organization.organizationId);

    await itemsPage.chooseRowAction(item.name, 'Delete');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await page.reload();
    await expect(itemsPage.row(item.name)).toBeVisible();
  });

  test('searching narrows the catalogue by name', async ({ organization, itemsPage, createItem }) => {
    const mouse = await createItem({ name: unique('Mouse') });
    const cable = await createItem({ name: unique('Cable') });
    await itemsPage.goto(organization.organizationId);
    await expect(itemsPage.row(cable.name)).toBeVisible();

    await itemsPage.search('mouse');

    await expect(itemsPage.row(mouse.name)).toBeVisible();
    await expect(itemsPage.row(cable.name)).toHaveCount(0);
  });
});
