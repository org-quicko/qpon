import { HomePage } from './home-page';

/** Which tab of /:organization_id/home/settings a test wants. */
export type SettingsTab = 'Profile' | 'Organisation' | 'Team' | 'API Keys';

/**
 * Settings at /:organization_id/home/settings — the signed-in user's profile,
 * the organization's own, its team, and its API key, one per tab.
 *
 * `row` and `chooseRowAction` address the team table.
 */
export class SettingsPage extends HomePage {
  // Profile tab.
  readonly editProfileButton = this.page.getByRole('button', { name: 'Edit details' });

  // Organisation tab.
  readonly editOrganizationNameButton = this.page.getByRole('button', { name: 'Edit name' });
  readonly deleteOrganizationButton = this.page.getByRole('button', {
    name: 'Delete organisation',
  });

  // Team tab. The label is "Add", behind the icon's own ligature text.
  readonly addMemberButton = this.page.getByRole('button', { name: 'Add', exact: false });

  // API Keys tab.
  readonly generateApiKeyButton = this.page.getByRole('button', { name: 'Generate API Key' });
  readonly regenerateApiKeyButton = this.page.getByRole('button', { name: 'Regenerate API Key' });

  async goto(organizationId: string, tab: SettingsTab = 'Profile'): Promise<void> {
    await this.open(`/${organizationId}/home/settings`);
    await this.openTab(tab);
  }

  async openTab(tab: SettingsTab): Promise<void> {
    await this.page.getByRole('tab', { name: tab }).click();
  }
}
