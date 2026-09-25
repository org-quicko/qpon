import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import { QponApi, type Item, type NewItem, type Organization } from '../api/qpon-api';
import { credentials, env, type MemberRole } from '../env';
import { ItemForm } from '../pages/item-form';
import { ItemsPage } from '../pages/items-page';

type Options = {
  /** Who the browser is signed in as. Override per file or describe with `test.use({ role })`. */
  role: MemberRole;
};

type TestFixtures = {
  /** A fresh organization the signed-in user belongs to with `role`; deleted after the test. */
  organization: Organization;
  /** Creates an item in the test's organization through the API. */
  createItem: (overrides?: Partial<NewItem>) => Promise<Item>;
  itemsPage: ItemsPage;
  itemForm: ItemForm;
};

type WorkerFixtures = {
  /** API client signed in as the super admin, used to arrange data. */
  superAdmin: QponApi;
  /** Access tokens for the member users, fetched once per worker. */
  accessTokenFor: (role: MemberRole) => Promise<string>;
};

/** Short random suffix: unique enough to never collide across tests, workers or runs. */
export const unique = (prefix: string): string => `${prefix} ${randomUUID().slice(0, 8)}`;

export const test = base.extend<Options & TestFixtures, WorkerFixtures>({
  role: ['admin', { option: true }],

  superAdmin: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      await use(await QponApi.signIn(request, credentials.superAdmin));
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  accessTokenFor: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      const tokens = new Map<MemberRole, Promise<string>>();
      await use((role) => {
        if (!tokens.has(role)) {
          tokens.set(role, QponApi.accessToken(request, credentials.members[role]));
        }
        return tokens.get(role)!;
      });
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  organization: async ({ superAdmin, role }, use) => {
    // The "E2E" prefix makes orgs left behind by an aborted run easy to spot.
    const organization = await superAdmin.createOrganization(unique('E2E'));
    await superAdmin.addMember(organization.organizationId, credentials.members[role], role);
    await use(organization);
    await superAdmin.deleteOrganization(organization.organizationId);
  },

  // Signing in is not what these tests are about, so skip the login form and
  // hand the browser the same cookie the app sets after a successful login.
  context: async ({ context, role, accessTokenFor }, use) => {
    await context.addCookies([
      {
        name: 'QPON_ACCESS_TOKEN',
        value: await accessTokenFor(role),
        url: env.baseURL,
        sameSite: 'Lax',
      },
    ]);
    await use(context);
  },

  createItem: async ({ superAdmin, organization }, use) => {
    await use((overrides = {}) =>
      superAdmin.createItem(organization.organizationId, {
        name: unique('Item'),
        description: 'Created by an e2e fixture',
        externalId: unique('sku').replace(' ', '-'),
        ...overrides,
      }),
    );
  },

  itemsPage: async ({ page, role }, use) => {
    await use(new ItemsPage(page, role));
  },

  itemForm: async ({ page }, use) => {
    await use(new ItemForm(page));
  },
});

export { expect };
