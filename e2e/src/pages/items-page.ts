import { expect, type Locator, type Page } from '@playwright/test';
import type { MemberRole } from '../env';

/** The item catalogue at /:organization_id/home/items. */
export class ItemsPage {
  readonly addItemButton: Locator;
  readonly searchBox: Locator;
  readonly emptyState: Locator;

  constructor(
    private readonly page: Page,
    private readonly role: MemberRole,
  ) {
    // The empty state repeats the header's "Add item" button; either works.
    this.addItemButton = page.getByRole('button', { name: 'Add item' }).first();
    this.searchBox = page.getByPlaceholder('Search items');
    this.emptyState = page.getByText("You don't have any items in catalogue!");
  }

  /**
   * Opens the catalogue and waits until the header confirms the signed-in
   * role. Permissions are applied at that same moment, so acting any earlier
   * can hit an ability set that hasn't loaded yet.
   */
  async goto(organizationId: string): Promise<void> {
    await this.page.goto(`/${organizationId}/home/items`);
    await expect(this.page.getByText(new RegExp(`You.re the ${this.role}`))).toBeVisible();
  }

  row(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
  }

  async chooseRowAction(itemName: string, action: 'Edit' | 'Delete'): Promise<void> {
    await this.page.getByRole('button', { name: `Actions for ${itemName}` }).click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }
}
