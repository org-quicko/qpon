import { test as setup } from '@playwright/test';
import { QponApi } from '../src/api/qpon-api';
import { credentials, env, type MemberRole } from '../src/env';

/**
 * Makes sure the accounts the suite signs in with exist, on any database:
 * a fresh one gets them created, an existing one just gets them verified.
 * Runs once, before any worker starts.
 */
setup('bootstrap test accounts', async ({ request }) => {
  const anonymous = new QponApi(request);
  if (!(await anonymous.superAdminExists())) {
    await anonymous.createSuperAdmin(credentials.superAdmin);
  }

  const superAdmin = await QponApi.signIn(request, credentials.superAdmin).catch((error: Error) => {
    throw new Error(
      `${error.message}\n\n${env.apiURL} already has a super admin, but not with the ` +
        'configured credentials. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in e2e/.env.e2e.',
    );
  });

  // Users can only be created by inviting them into an organization. Do that
  // once here, so parallel workers never race to create the same user, then
  // drop the organization — the users themselves are kept for reuse.
  const bootstrap = await superAdmin.createOrganization(`E2E bootstrap ${Date.now()}`);
  try {
    for (const role of Object.keys(credentials.members) as MemberRole[]) {
      const member = credentials.members[role];
      await superAdmin.addMember(bootstrap.organizationId, member, role);
      // Inviting an existing user keeps their old password, so prove it matches.
      await QponApi.accessToken(request, member);
    }
  } finally {
    await superAdmin.deleteOrganization(bootstrap.organizationId);
  }
});
