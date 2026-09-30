import { HomePage } from './home-page';

/** The customer list at /:organization_id/home/customers. */
export class CustomersPage extends HomePage {
  // The empty state repeats the header's "Add customer" button; either works.
  readonly addCustomerButton = this.page.getByRole('button', { name: 'Add customer' }).first();
  readonly searchBox = this.page.getByPlaceholder('Search customers');
  readonly emptyState = this.page.getByText('You haven’t added any customers yet.');

  async goto(organizationId: string): Promise<void> {
    await this.open(`/${organizationId}/home/customers`);
  }

  /** The list filters on email, not name. */
  async search(email: string): Promise<void> {
    await this.searchBox.fill(email);
  }
}
