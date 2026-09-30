import type { Locator } from '@playwright/test';
import type { NewCustomer } from '../api/qpon-api';
import { Wizard } from './wizard';

/**
 * The customer form. The create flow (/customers/create) and the edit page
 * (/customers/:id/edit) render the same fields, so both use this.
 */
export class CustomerWizard extends Wizard {
  readonly name: Locator = this.page.getByLabel('Customer Name');
  readonly email: Locator = this.page.getByLabel('Email');
  readonly phone: Locator = this.page.getByLabel('Phone');
  readonly externalId: Locator = this.page.getByLabel('External id');
  readonly addMoreButton: Locator = this.page.getByRole('button', { name: 'Add more' });

  async fill(customer: Partial<NewCustomer>): Promise<void> {
    if (customer.name !== undefined) await this.name.fill(customer.name);
    if (customer.email !== undefined) await this.email.fill(customer.email);
    if (customer.phone !== undefined) await this.phone.fill(customer.phone);
    if (customer.externalId !== undefined) await this.externalId.fill(customer.externalId);
  }

  /** The card standing for an entered-but-not-yet-saved customer. */
  pendingCustomer(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(name) });
  }
}
