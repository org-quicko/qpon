import type { Locator, Page } from '@playwright/test';
import type { NewItem } from '../api/qpon-api';

/**
 * The item form. The create wizard (/items/create) and the edit page
 * (/items/:id/edit) render the same fields, so both flows share this.
 */
export class ItemForm {
  readonly name: Locator;
  readonly description: Locator;
  readonly externalId: Locator;
  readonly nextButton: Locator;
  readonly saveButton: Locator;
  readonly addMoreButton: Locator;

  constructor(page: Page) {
    this.name = page.getByLabel('Item name');
    this.description = page.getByLabel('Description');
    this.externalId = page.getByLabel('External Id');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.addMoreButton = page.getByRole('button', { name: 'Add more' });
  }

  async fill(item: Partial<NewItem>): Promise<void> {
    if (item.name !== undefined) await this.name.fill(item.name);
    if (item.description !== undefined) await this.description.fill(item.description);
    if (item.externalId !== undefined) await this.externalId.fill(item.externalId);
  }
}
