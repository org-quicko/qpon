import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import {
  QponApi,
  type Campaign,
  type Coupon,
  type CouponCode,
  type Customer,
  type Item,
  type NewCampaign,
  type NewCoupon,
  type NewCouponCode,
  type NewCustomer,
  type NewItem,
  type Organization,
} from '../api/qpon-api';
import { credentials, env, type MemberRole } from '../env';
import { CampaignPage } from '../pages/campaign-page';
import { CouponCodeWizard } from '../pages/coupon-code-wizard';
import { CouponPage } from '../pages/coupon-page';
import { CouponWizard } from '../pages/coupon-wizard';
import { CouponsPage } from '../pages/coupons-page';
import { CustomerWizard } from '../pages/customer-wizard';
import { CustomersPage } from '../pages/customers-page';
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
  /** Creates a customer in the test's organization through the API. */
  createCustomer: (overrides?: Partial<NewCustomer>) => Promise<Customer>;
  /** Creates a coupon in the test's organization through the API. */
  createCoupon: (overrides?: Partial<NewCoupon>) => Promise<Coupon>;
  /** Creates a campaign under `coupon` through the API. */
  createCampaign: (coupon: Coupon, overrides?: Partial<NewCampaign>) => Promise<Campaign>;
  /** Creates a coupon code under `campaign` through the API. */
  createCouponCode: (
    coupon: Coupon,
    campaign: Campaign,
    overrides?: Partial<NewCouponCode>,
  ) => Promise<CouponCode>;
  itemsPage: ItemsPage;
  itemForm: ItemForm;
  customersPage: CustomersPage;
  customerWizard: CustomerWizard;
  couponsPage: CouponsPage;
  couponPage: CouponPage;
  couponWizard: CouponWizard;
  campaignPage: CampaignPage;
  couponCodeWizard: CouponCodeWizard;
};

type WorkerFixtures = {
  /** API client signed in as the super admin, used to arrange data. */
  superAdmin: QponApi;
  /** Access tokens for the member users, fetched once per worker. */
  accessTokenFor: (role: MemberRole) => Promise<string>;
};

/** Short random suffix: unique enough to never collide across tests, workers or runs. */
export const unique = (prefix: string): string => `${prefix} ${randomUUID().slice(0, 8)}`;

/** Same, for the identifier-shaped values the app will not accept a space in. */
export const uniqueSlug = (prefix: string): string => `${prefix}-${randomUUID().slice(0, 8)}`;

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
        externalId: uniqueSlug('sku'),
        ...overrides,
      }),
    );
  },

  createCustomer: async ({ superAdmin, organization }, use) => {
    await use((overrides = {}) =>
      superAdmin.createCustomer(organization.organizationId, {
        name: unique('Customer'),
        // Customers are unique on email, so that is what has to vary.
        email: `${uniqueSlug('customer')}@qpon.test`,
        externalId: uniqueSlug('cust'),
        ...overrides,
      }),
    );
  },

  createCoupon: async ({ superAdmin, organization }, use) => {
    await use((overrides = {}) =>
      superAdmin.createCoupon(organization.organizationId, {
        name: unique('Coupon'),
        discountType: 'percentage',
        discountValue: 10,
        itemConstraint: 'all',
        ...overrides,
      }),
    );
  },

  createCampaign: async ({ superAdmin, organization }, use) => {
    await use((coupon, overrides = {}) =>
      superAdmin.createCampaign(organization.organizationId, coupon.couponId, {
        name: unique('Campaign'),
        ...overrides,
      }),
    );
  },

  createCouponCode: async ({ superAdmin, organization }, use) => {
    await use((coupon, campaign, overrides = {}) =>
      superAdmin.createCouponCode(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
        {
          // The app upper-cases whatever you type, so match that here.
          code: uniqueSlug('CODE').toUpperCase(),
          customerConstraint: 'all',
          visibility: 'public',
          durationType: 'forever',
          ...overrides,
        },
      ),
    );
  },

  itemsPage: async ({ page, role }, use) => {
    await use(new ItemsPage(page, role));
  },

  itemForm: async ({ page }, use) => {
    await use(new ItemForm(page));
  },

  customersPage: async ({ page, role }, use) => {
    await use(new CustomersPage(page, role));
  },

  customerWizard: async ({ page }, use) => {
    await use(new CustomerWizard(page));
  },

  couponsPage: async ({ page, role }, use) => {
    await use(new CouponsPage(page, role));
  },

  couponPage: async ({ page, role }, use) => {
    await use(new CouponPage(page, role));
  },

  couponWizard: async ({ page }, use) => {
    await use(new CouponWizard(page));
  },

  campaignPage: async ({ page, role }, use) => {
    await use(new CampaignPage(page, role));
  },

  couponCodeWizard: async ({ page }, use) => {
    await use(new CouponCodeWizard(page));
  },
});

export { expect };
