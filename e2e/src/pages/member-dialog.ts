import type { Locator, Page } from '@playwright/test';
import type { MemberRole } from '../env';

/**
 * The dialog behind the team tab's "Add" and "Edit details". Adding asks for a
 * password and confirmation; editing drops both, since it only changes who the
 * member is and what they may do.
 */
export class MemberDialog {
  readonly dialog: Locator;
  readonly role: Locator;
  readonly email: Locator;
  readonly name: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly addButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.role = this.dialog.getByLabel('Role');
    this.email = this.dialog.getByLabel('Email');
    this.name = this.dialog.getByLabel('Name', { exact: true });
    this.password = this.dialog.getByLabel('Set Password');
    this.confirmPassword = this.dialog.getByLabel('Confirm Password');
    this.addButton = this.dialog.getByRole('button', { name: 'Add', exact: true });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /**
   * Role is a select, so it opens a listbox rather than taking typed input.
   * The options are title-cased on screen; matching ignores the case.
   */
  async chooseRole(role: MemberRole): Promise<void> {
    await this.role.click();
    await this.page.getByRole('option', { name: role }).click();
  }

  async fill(member: { name?: string; email?: string; password?: string }): Promise<void> {
    if (member.name !== undefined) await this.name.fill(member.name);
    if (member.email !== undefined) await this.email.fill(member.email);
    if (member.password !== undefined) {
      await this.password.fill(member.password);
      await this.confirmPassword.fill(member.password);
    }
  }
}
