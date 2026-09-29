import { HomePage } from './home-page';

/** The item catalogue at /:organization_id/home/items. */
export class ItemsPage extends HomePage {
  // The empty state repeats the header's "Add item" button; either works.
  readonly addItemButton = this.page.getByRole('button', { name: 'Add item' }).first();
  readonly searchBox = this.page.getByPlaceholder('Search items');
  readonly emptyState = this.page.getByText("You don't have any items in catalogue!");

  async goto(organizationId: string): Promise<void> {
    await this.open(`/${organizationId}/home/items`);
  }

  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
  }
}
