import { credentials } from '../../src/env';
import { expect, test, unique, uniqueSlug } from '../../src/fixtures';

const PASSWORD = 'Teammate#e2e1';
const someEmail = () => `${uniqueSlug('teammate')}@qpon.test`;

test.describe('Managing the team', () => {
  test('the team lists who is in the organization', async ({
    organization,
    settingsPage,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Team');

    const me = settingsPage.row(credentials.members.admin.email);
    await expect(me).toContainText(credentials.members.admin.name);
    // The role is stored lower-case and capitalised by CSS, so this has to
    // read the rendered text rather than the markup.
    await expect(me).toContainText('Admin', { useInnerText: true });
  });

  test('admin adds a member', async ({ page, organization, settingsPage, memberDialog }) => {
    const name = unique('Rohan');
    const email = someEmail();
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.addMemberButton.click();
    await expect(memberDialog.dialog).toContainText('Add Member');
    await memberDialog.chooseRole('editor');
    await memberDialog.fill({ name, email, password: PASSWORD });
    await memberDialog.addButton.click();

    await expect(page.getByText('User created successfully')).toBeVisible();
    await expect(settingsPage.row(name)).toBeVisible();
    await expect(settingsPage.row(name)).toContainText(email);
    await expect(settingsPage.row(name)).toContainText('Editor', { useInnerText: true });
  });

  test('a member needs a role, a name, an email and a password', async ({
    organization,
    settingsPage,
    memberDialog,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.addMemberButton.click();
    await memberDialog.addButton.click();

    await expect(memberDialog.dialog).toContainText('Role is required');
    await expect(memberDialog.dialog).toContainText('Email is required');
    await expect(memberDialog.dialog).toContainText('Name is required');
    await expect(memberDialog.dialog).toContainText('Password is required');
    // Nothing was saved, so the dialog is still open.
    await expect(memberDialog.dialog).toContainText('Add Member');
  });

  test('the two passwords have to match', async ({
    organization,
    settingsPage,
    memberDialog,
  }) => {
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.addMemberButton.click();
    await memberDialog.chooseRole('viewer');
    await memberDialog.fill({ name: unique('Fat Fingers'), email: someEmail() });
    await memberDialog.password.fill(PASSWORD);
    await memberDialog.confirmPassword.fill('Something#else1');
    await memberDialog.addButton.click();

    await expect(memberDialog.dialog).toContainText('Passwords do not match');
  });

  test('admin changes a member’s role', async ({
    page,
    organization,
    settingsPage,
    memberDialog,
    inviteMember,
  }) => {
    const member = await inviteMember({ role: 'viewer' });
    await settingsPage.goto(organization.organizationId, 'Team');
    await expect(settingsPage.row(member.name)).toContainText('Viewer', { useInnerText: true });

    await settingsPage.chooseRowAction(member.name, 'Edit details');
    await expect(memberDialog.dialog).toContainText('Edit Member');
    // Editing an existing member never asks for a password.
    await expect(memberDialog.password).toHaveCount(0);
    await expect(memberDialog.email).toHaveValue(member.email);

    await memberDialog.chooseRole('admin');
    await memberDialog.saveButton.click();

    await expect(page.getByText('Role updated successfully')).toBeVisible();
    await expect(settingsPage.row(member.name)).toContainText('Admin', { useInnerText: true });
  });

  test('admin removes a member after confirming', async ({
    page,
    organization,
    settingsPage,
    inviteMember,
  }) => {
    const member = await inviteMember();
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.chooseRowAction(member.name, 'Remove');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Remove ${member.name} from ${organization.name}?`);
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('User deleted successfully')).toBeVisible();
    await expect(settingsPage.row(member.name)).toHaveCount(0);
  });

  test('cancelling the removal keeps the member', async ({
    page,
    organization,
    settingsPage,
    inviteMember,
  }) => {
    const member = await inviteMember();
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.chooseRowAction(member.name, 'Remove');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(settingsPage.row(member.name)).toBeVisible();
  });

  test('admin cannot remove themselves', async ({ page, organization, settingsPage }) => {
    await settingsPage.goto(organization.organizationId, 'Team');

    await settingsPage.chooseRowAction(credentials.members.admin.name, 'Remove');

    await expect(page.getByText('You cannot delete yourself')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(settingsPage.row(credentials.members.admin.email)).toBeVisible();
  });
});

for (const role of ['editor', 'viewer'] as const) {
  test.describe(`${role[0].toUpperCase()}${role.slice(1)}`, () => {
    test.use({ role });

    test('can see the team', async ({ organization, settingsPage }) => {
      await settingsPage.goto(organization.organizationId, 'Team');

      await expect(settingsPage.row(credentials.members[role].email)).toBeVisible();
    });

    test('is told they cannot add members', async ({ page, organization, settingsPage }) => {
      await settingsPage.goto(organization.organizationId, 'Team');

      await settingsPage.addMemberButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toContainText('Action not allowed!');
      await expect(dialog).toContainText('You do not have permission to create the member.');
    });

    test('is told they cannot change a role', async ({
      page,
      organization,
      settingsPage,
      inviteMember,
    }) => {
      const member = await inviteMember();
      await settingsPage.goto(organization.organizationId, 'Team');

      await settingsPage.chooseRowAction(member.name, 'Edit details');

      await expect(page.getByRole('dialog')).toContainText(
        'You do not have permission to update member.',
      );
    });

    test('is told they cannot remove members', async ({
      page,
      organization,
      settingsPage,
      inviteMember,
    }) => {
      const member = await inviteMember();
      await settingsPage.goto(organization.organizationId, 'Team');

      await settingsPage.chooseRowAction(member.name, 'Remove');

      const dialog = page.getByRole('dialog');
      await expect(dialog).toContainText('You do not have permission to remove member.');
      // The dialog takes the page out of the accessibility tree while it is
      // open, so the table is only addressable again once it is dismissed.
      await dialog.getByRole('button', { name: 'Got it!' }).click();
      await expect(settingsPage.row(member.name)).toBeVisible();
    });
  });
}
