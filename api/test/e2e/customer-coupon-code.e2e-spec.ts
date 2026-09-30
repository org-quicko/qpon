import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import {
  createCustomer,
  createCustomerCouponCode,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { Customer } from '../../src/entities/customer.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

/**
 * The allow-list that makes a `customerConstraint: SPECIFIC` coupon code
 * usable by named customers only. Note the controller is mounted without the
 * organization prefix — its path starts at /coupons.
 */
describe('customer coupon codes (e2e)', () => {
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

  let organization: Organization;
  let setup: Awaited<ReturnType<typeof createRedeemableSetup>>;
  let customerA: Customer;
  let customerB: Customer;
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    setup = await createRedeemableSetup(dataSource, organization);
    customerA = await createCustomer(dataSource, organization, {
      name: 'Customer A',
    });
    customerB = await createCustomer(dataSource, organization, {
      name: 'Customer B',
    });
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const customersUrl = () =>
    `/api/coupons/${setup.coupon.couponId}/campaigns/${setup.campaign.campaignId}/coupon-codes/${setup.couponCode.couponCodeId}/customers`;

  const countLinks = () =>
    dataSource
      .getRepository(CustomerCouponCode)
      .countBy({ couponCodeId: setup.couponCode.couponCodeId });

  describe('POST /customers', () => {
    it('links the given customers to the coupon code', async () => {
      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerA.customerId, customerB.customerId],
        })
        .expect(201);

      expect(await countLinks()).toBe(2);
    });

    it('400s when a customer id does not exist', async () => {
      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
        })
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerA.customerId],
          extra: true,
        })
        .expect(400);
    });
  });

  describe('GET /customers', () => {
    it('returns the linked customers', async () => {
      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);

      const response = await request(app.getHttpServer())
        .get(customersUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Customer A');
      expect(body).not.toContain('Customer B');
    });
  });

  describe('DELETE /customers/:customer_id', () => {
    it('removes just that link', async () => {
      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);
      await createCustomerCouponCode(dataSource, customerB, setup.couponCode);

      await request(app.getHttpServer())
        .delete(`${customersUrl()}/${customerA.customerId}`)
        .set(...auth)
        .expect(200);

      const remaining = await dataSource
        .getRepository(CustomerCouponCode)
        .findBy({ couponCodeId: setup.couponCode.couponCodeId });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].customerId).toBe(customerB.customerId);
    });

    it('leaves the customer record itself in place', async () => {
      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);

      await request(app.getHttpServer())
        .delete(`${customersUrl()}/${customerA.customerId}`)
        .set(...auth)
        .expect(200);

      expect(
        await dataSource
          .getRepository(Customer)
          .countBy({ customerId: customerA.customerId }),
      ).toBe(1);
    });
  });

  describe('PATCH /customers', () => {
    it('replaces the allow-list rather than appending to it', async () => {
      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);

      await request(app.getHttpServer())
        .patch(customersUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(200);

      const links = await dataSource
        .getRepository(CustomerCouponCode)
        .findBy({ couponCodeId: setup.couponCode.couponCodeId });
      expect(links).toHaveLength(1);
      expect(links[0].customerId).toBe(customerB.customerId);
    });

    // Regression guard for issue 5: this handler's @Permissions decorator was
    // commented out, and PermissionGuard returns true early for a handler
    // carrying no permission metadata — so any authenticated caller could
    // rewrite the allow-list of any coupon code in any organization.
    it('refuses a caller with no membership in the organization', async () => {
      const outsider = await createUserWithRole(dataSource, {
        role: roleEnum.REGULAR,
      });

      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);

      await request(app.getHttpServer())
        .patch(customersUrl())
        .set(...bearer(app, outsider))
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(403);
    });

    it('refuses a viewer', async () => {
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await createCustomerCouponCode(dataSource, customerA, setup.couponCode);

      await request(app.getHttpServer())
        .patch(customersUrl())
        .set(...bearer(app, viewer))
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(403);
    });

    // Guarding this handler introduced a subtlety: the guard resolves the
    // CustomerCouponCode subject by looking for an existing link, and an
    // empty allow-list has none. Without the fallback in
    // fetchCustomerForValidation the check is unevaluable and every caller —
    // including the organization's own admin — gets a 403.
    it('lets an admin populate an allow-list that is still empty', async () => {
      expect(await countLinks()).toBe(0);

      await request(app.getHttpServer())
        .patch(customersUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(200);

      expect(await countLinks()).toBe(1);
    });

    it('still refuses an outsider when the allow-list is empty', async () => {
      const outsider = await createUserWithRole(dataSource, {
        role: roleEnum.REGULAR,
      });

      await request(app.getHttpServer())
        .patch(customersUrl())
        .set(...bearer(app, outsider))
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(403);
    });

    it('still requires authentication', async () => {
      await request(app.getHttpServer())
        .patch(customersUrl())
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerB.customerId],
        })
        .expect(401);
    });
  });

  describe('authorization on the guarded handlers', () => {
    it('refuses a viewer the ability to add customers', async () => {
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...bearer(app, viewer))
        .send({
          '@entity': 'org.quicko.qpon.customer_coupon_code',
          customers: [customerA.customerId],
        })
        .expect(403);
    });
  });
});
