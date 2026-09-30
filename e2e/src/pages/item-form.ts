import type { Locator } from '@playwright/test';
import type { NewItem } from '../api/qpon-api';
import { Wizard } from './wizard';

/**
 * The item form. The create wizard (/items/create) and the edit page
 * (/items/:id/edit) render the same fields, so both flows share this.
 */
export class ItemForm extends Wizard {
  readonly name: Locator = this.page.getByLabel('Item name');
  readonly description: Locator = this.page.getByLabel('Description');
  readonly externalId: Locator = this.page.getByLabel('External Id');
  readonly addMoreButton: Locator = this.page.getByRole('button', { name: 'Add more' });

  async fill(item: Partial<NewItem>): Promise<void> {
    if (item.name !== undefined) await this.name.fill(item.name);
    if (item.description !== undefined) await this.description.fill(item.description);
    if (item.externalId !== undefined) await this.externalId.fill(item.externalId);
  }
}
