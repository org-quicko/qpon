import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import {
  createCampaign,
  createCoupon,
  createItem,
  createOrganization,
} from '../support/factories';
import { Campaign } from '../../src/entities/campaign.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Customer } from '../../src/entities/customer.entity';
import { Item } from '../../src/entities/item.entity';
import { Organization } from '../../src/entities/organization.entity';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

/**
 * Cross-resource cover for the organization scoping in AuthorizationService.
 *
 * The rules there were rewritten from CASL's `fields` argument (an array,
 * which imposed no organization restriction at all) to `conditions` (an
 * object). That change has two distinct failure modes, and each resource
 * below is checked for both:
 *
 *  - too loose — a member of one organization reaches another's records;
 *  - too tight — the condition reads a relation the service never loaded,
 *    so it compares against `undefined` and locks out legitimate members.
 *
 * The second is why Customer and ApiKey needed `relations: { organization }`
 * added to their validation lookups.
 */
describe('tenant isolation across resources (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp({ http: true });
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let homeOrg: Organization;
  let foreignOrg: Organization;
  let homeAdmin: User;
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    homeOrg = await createOrganization(dataSource);
    foreignOrg = await createOrganization(dataSource);
    homeAdmin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization: homeOrg,
    });
    auth = bearer(app, homeAdmin);
  });

  async function seedCustomer(organization: Organization): Promise<Customer> {
    const repo = dataSource.getRepository(Customer);
    return repo.save(
      repo.create({
        name: 'Customer',
        email: `customer-${Math.random().toString(16).slice(2)}@test.local`,
        organization: { organizationId: organization.organizationId },
      }),
    );
  }

  describe('items', () => {
    it('an admin can delete an item in their own organization', async () => {
      const item = await createItem(dataSource, homeOrg);

      await request(app.getHttpServer())
        .delete(`/api/organizations/${homeOrg.organizationId}/items/${item.itemId}`)
        .set(...auth)
        .expect(200);
    });

    it('an admin cannot delete an item in another organization', async () => {
      const item = await createItem(dataSource, foreignOrg);

      const response = await request(app.getHttpServer())
        .delete(
          `/api/organizations/${foreignOrg.organizationId}/items/${item.itemId}`,
        )
        .set(...auth);

      expect(response.status).toBe(403);

      const stored = await dataSource
        .getRepository(Item)
        .findOneBy({ itemId: item.itemId });
      expect(stored).not.toBeNull();
    });
  });

  describe('customers', () => {
    it('an admin can delete a customer in their own organization', async () => {
      const customer = await seedCustomer(homeOrg);

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${homeOrg.organizationId}/customers/${customer.customerId}`,
        )
        .set(...auth)
        .expect(200);
    });

    it('an admin cannot delete a customer in another organization', async () => {
      const customer = await seedCustomer(foreignOrg);

      const response = await request(app.getHttpServer())
        .delete(
          `/api/organizations/${foreignOrg.organizationId}/customers/${customer.customerId}`,
        )
        .set(...auth);

      expect(response.status).toBe(403);
    });
  });

  describe('campaigns', () => {
    it('an admin can delete a campaign in their own organization', async () => {
      const coupon = await createCoupon(dataSource, homeOrg);
      const campaign = await createCampaign(dataSource, homeOrg, coupon, {});

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${homeOrg.organizationId}/coupons/${coupon.couponId}/campaigns/${campaign.campaignId}`,
        )
        .set(...auth)
        .expect(200);
    });

    it('an admin cannot delete a campaign in another organization', async () => {
      const coupon = await createCoupon(dataSource, foreignOrg);
      const campaign = await createCampaign(dataSource, foreignOrg, coupon, {});

      const response = await request(app.getHttpServer())
        .delete(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${coupon.couponId}/campaigns/${campaign.campaignId}`,
        )
        .set(...auth);

      expect(response.status).toBe(403);

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(stored.status).not.toBe('archive');
    });
  });

  describe('api keys', () => {
    it('an admin can read the api key of their own organization', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${homeOrg.organizationId}/api-keys`)
        .set(...auth);

      // No key exists yet, so the handler may report "not found" — the point
      // is that authorization let the request through rather than 403ing.
      expect(response.status).not.toBe(403);
    });

    // Regression guard: getSubjectTypes used to early-return the bare subject
    // CLASS for create/read/read_all. CASL evaluates a rule's conditions only
    // against an instance, so the organization scope was skipped entirely and
    // any member of any organization was let through.
    it('an admin cannot create an api key for another organization', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/organizations/${foreignOrg.organizationId}/api-keys`)
        .set(...auth)
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('coupons belonging to a foreign organization', () => {
    it('cannot be deactivated', async () => {
      const coupon = await createCoupon(dataSource, foreignOrg);

      const response = await request(app.getHttpServer())
        .post(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${coupon.couponId}/deactivate`,
        )
        .set(...auth);

      expect(response.status).toBe(403);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.status).toBe('active');
    });

    it('cannot be renamed', async () => {
      const coupon = await createCoupon(dataSource, foreignOrg, {
        name: 'Untouched',
      });

      const response = await request(app.getHttpServer())
        .patch(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${coupon.couponId}`,
        )
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'Hijacked' });

      expect(response.status).toBe(403);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.name).toBe('Untouched');
    });
  });

  /**
   * Reads were the larger half of the scoping hole: `read`, `read_all` and
   * `create` all resolved to a bare subject class, so a member of any
   * organization could list or fetch any other organization's records simply
   * by putting the foreign id in the path. Each case below is paired with the
   * same request against the caller's own organization, so a fix that merely
   * refuses everything cannot pass.
   */
  describe('cross-organization reads', () => {
    const cases: { name: string; path: (o: Organization) => string }[] = [
      { name: 'coupon list', path: (o) => `/api/organizations/${o.organizationId}/coupons` },
      { name: 'item list', path: (o) => `/api/organizations/${o.organizationId}/items` },
      { name: 'customer list', path: (o) => `/api/organizations/${o.organizationId}/customers` },
      { name: 'redemption list', path: (o) => `/api/organizations/${o.organizationId}/redemptions` },
      { name: 'offer list', path: (o) => `/api/organizations/${o.organizationId}/offers` },
      { name: 'api key', path: (o) => `/api/organizations/${o.organizationId}/api-keys` },
      { name: 'organization summary', path: (o) => `/api/organizations/${o.organizationId}/summary` },
      { name: 'sales summary', path: (o) => `/api/organizations/${o.organizationId}/sales/summary` },
      { name: 'item summary', path: (o) => `/api/organizations/${o.organizationId}/items/summary` },
      { name: 'coupon code summary', path: (o) => `/api/organizations/${o.organizationId}/coupon_codes/summary` },
    ];

    it.each(cases)('refuses the $name of another organization', async ({ path }) => {
      await request(app.getHttpServer())
        .get(path(foreignOrg))
        .set(...auth)
        .expect(403);
    });

    it.each(cases)('still allows the $name of the caller’s own organization', async ({ path }) => {
      const response = await request(app.getHttpServer())
        .get(path(homeOrg))
        .set(...auth);

      expect(response.status).not.toBe(403);
    });

    it('refuses reading a single coupon of another organization', async () => {
      const coupon = await createCoupon(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${coupon.couponId}`,
        )
        .set(...auth)
        .expect(403);
    });

    it('refuses a foreign coupon even when the caller’s own organization id is in the path', async () => {
      // The subject for a single read is the coupon itself, not the path
      // organization — otherwise pairing your own org id with someone else's
      // coupon id would sail through.
      const coupon = await createCoupon(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${homeOrg.organizationId}/coupons/${coupon.couponId}`,
        )
        .set(...auth)
        .expect(403);
    });

    it('still allows reading a single coupon of the caller’s own organization', async () => {
      const coupon = await createCoupon(dataSource, homeOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${homeOrg.organizationId}/coupons/${coupon.couponId}`,
        )
        .set(...auth)
        .expect(200);
    });

    it('refuses reading a single item of another organization', async () => {
      const item = await createItem(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${foreignOrg.organizationId}/items/${item.itemId}`,
        )
        .set(...auth)
        .expect(403);
    });

    it('refuses listing the coupon items of another organization’s coupon', async () => {
      const coupon = await createCoupon(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${coupon.couponId}/items`,
        )
        .set(...auth)
        .expect(403);
    });

    it('still allows listing the coupon items of the caller’s own coupon', async () => {
      const coupon = await createCoupon(dataSource, homeOrg);

      await request(app.getHttpServer())
        .get(
          `/api/organizations/${homeOrg.organizationId}/coupons/${coupon.couponId}/items`,
        )
        .set(...auth)
        .expect(200);
    });
  });

  describe('cross-organization creates', () => {
    it('refuses creating a coupon in another organization', async () => {
      await request(app.getHttpServer())
        .post(`/api/organizations/${foreignOrg.organizationId}/coupons`)
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon',
          name: 'Planted',
          discount_type: 'percentage',
          discount_value: 10,
          item_constraint: 'all',
        })
        .expect(403);

      expect(
        await dataSource.getRepository(Coupon).countBy({ name: 'Planted' }),
      ).toBe(0);
    });

    it('still allows creating a coupon in the caller’s own organization', async () => {
      await request(app.getHttpServer())
        .post(`/api/organizations/${homeOrg.organizationId}/coupons`)
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon',
          name: 'Legitimate',
          discount_type: 'percentage',
          discount_value: 10,
          item_constraint: 'all',
        })
        .expect(201);
    });

    it('refuses creating an item in another organization', async () => {
      await request(app.getHttpServer())
        .post(`/api/organizations/${foreignOrg.organizationId}/items`)
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.item',
          name: 'Planted item',
          external_id: 'sku-planted',
        })
        .expect(403);
    });

    it('refuses creating a customer in another organization', async () => {
      await request(app.getHttpServer())
        .post(`/api/organizations/${foreignOrg.organizationId}/customers`)
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer',
          name: 'Planted customer',
          email: 'planted@test.local',
          external_id: 'cust-planted',
        })
        .expect(403);
    });
  });

  describe('a member of both organizations', () => {
    it('keeps access to each one', async () => {
      const dualMember = await createUserWithRole(dataSource, {
        role: roleEnum.ADMIN,
        organization: homeOrg,
      });
      const membershipRepo = dataSource.getRepository('organization_user');
      await membershipRepo.save({
        organizationId: foreignOrg.organizationId,
        userId: dualMember.userId,
        role: roleEnum.ADMIN,
      });

      const homeItem = await createItem(dataSource, homeOrg);
      const foreignItem = await createItem(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${homeOrg.organizationId}/items/${homeItem.itemId}`,
        )
        .set(...bearer(app, dualMember))
        .expect(200);

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${foreignOrg.organizationId}/items/${foreignItem.itemId}`,
        )
        .set(...bearer(app, dualMember))
        .expect(200);
    });
  });
});
