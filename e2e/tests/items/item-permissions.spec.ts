import { expect, test, unique } from '../../src/fixtures';

const NOT_ALLOWED_REASON = 'Only editors and admins are allowed to edit, create or delete.';

test.describe('Viewer', () => {
  test.use({ role: 'viewer' });

  test('can browse the catalogue', async ({ organization, itemsPage, createItem }) => {
    const item = await createItem({ description: 'Visible to everyone' });
    await itemsPage.goto(organization.organizationId);

    await expect(itemsPage.row(item.name)).toContainText('Visible to everyone');
  });

  test('is told they cannot add items', async ({ page, organization, itemsPage }) => {
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Action not allowed!');
    await expect(dialog).toContainText(NOT_ALLOWED_REASON);
    await dialog.getByRole('button', { name: 'Got it!' }).click();
    await expect(page).toHaveURL(new RegExp('/home/items$'));
  });

  for (const action of ['Edit', 'Delete'] as const) {
    test(`is told they cannot ${action.toLowerCase()} items`, async ({ page, organization, itemsPage, createItem }) => {
      const item = await createItem();
      await itemsPage.goto(organization.organizationId);

      await itemsPage.chooseRowAction(item.name, action);

      await expect(page.getByRole('dialog')).toContainText(NOT_ALLOWED_REASON);
      await page.getByRole('button', { name: 'Got it!' }).click();
      await expect(itemsPage.row(item.name)).toBeVisible();
    });
  }
});

test.describe('Editor', () => {
  test.use({ role: 'editor' });

  test('can add items', async ({ page, organization, itemsPage, itemForm }) => {
    const name = unique('Editor item');
    await itemsPage.goto(organization.organizationId);

    await itemsPage.addItemButton.click();
    await itemForm.fill({ name, externalId: 'SKU-EDITOR-1' });
    await itemForm.nextButton.click();
    await itemForm.saveButton.click();

    await expect(page.getByText('Items created successfully')).toBeVisible();
    await expect(itemsPage.row(name)).toBeVisible();
  });
});
