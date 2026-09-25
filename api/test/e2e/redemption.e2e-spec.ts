import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import {
  createCouponItem,
  createCustomer,
  createCustomerCouponCode,
  createItem,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Redemption } from '../../src/entities/redemption.entity';
import { Organization } from '../../src/entities/organization.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  itemConstraintEnum,
  roleEnum,
} from '../../src/enums';

/**
 * The redemption endpoint carries the most business logic in the API: seven
 * distinct validations, each with its own status code, plus two side effects
 * (the redemption counter, and flipping a code to `redeemed` once its cap is
 * reached). Each branch gets its own case below.
 */
describe('redemptions (e2e)', () => {
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
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const redeemUrl = () =>
    `/api/organizations/${organization.organizationId}/coupon-codes/redeem`;

  const body = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.redemption',
    code: 'SAVE20',
    base_order_value: 1000,
    discount: 100,
    external_customer_id: 'cust-1',
    external_item_id: 'item-1',
    ...overrides,
  });

  describe('successful redemption', () => {
    it('records the redemption and increments the code counter', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);

      const redemptions = await dataSource.getRepository(Redemption).find({
        relations: { couponCode: true, customer: true, item: true },
      });
      expect(redemptions).toHaveLength(1);
      expect(redemptions[0].couponCode.couponCodeId).toBe(
        setup.couponCode.couponCodeId,
      );
      expect(Number(redemptions[0].baseOrderValue)).toBe(1000);

      const storedCode = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: setup.couponCode.couponCodeId });
      expect(storedCode.redemptionCount).toBe(1);
    });

    it('flips the code to redeemed once maxRedemptions is reached', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptions: 1 },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);

      const storedCode = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: setup.couponCode.couponCodeId });
      expect(storedCode.status).toBe(couponCodeStatusEnum.REDEEMED);
    });

    it('accepts an optional external id on the redemption', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
            external_id: 'order-9001',
          }),
        )
        .expect(201);

      const stored = await dataSource.getRepository(Redemption).find();
      expect(stored[0].externalId).toBe('order-9001');
    });
  });

  describe('coupon code validation', () => {
    it('404s for a code that does not exist', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: 'NOSUCHCODE',
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(404);
    });

    it('404s for a code that is not active', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { status: couponCodeStatusEnum.INACTIVE },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(404);
    });

    it('410s for a limited-duration code whose expiry has passed', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          durationType: durationTypeEnum.LIMITED,
          expiresAt: new Date(Date.now() - 60_000),
        },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(410);
    });

    it('accepts a limited-duration code that has not expired yet', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          durationType: durationTypeEnum.LIMITED,
          expiresAt: new Date(Date.now() + 3_600_000),
        },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);
    });
  });

  describe('customer validation', () => {
    it('404s when no customer matches the external id', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: 'ghost-customer',
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(404);
    });

    it('409s when the code is customer-restricted and this customer is not linked', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { customerConstraint: customerConstraintEnum.SPECIFIC },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(409);
    });

    it('succeeds when the restricted code is linked to the customer', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { customerConstraint: customerConstraintEnum.SPECIFIC },
      });
      await createCustomerCouponCode(
        dataSource,
        setup.customer,
        setup.couponCode,
      );

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);
    });
  });

  describe('item validation', () => {
    it('404s when no item matches the external id', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: 'ghost-item',
          }),
        )
        .expect(404);
    });

    it('409s when the coupon is item-restricted and the item is not on it', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(409);
    });

    it('succeeds when the restricted coupon includes the item', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });
      await createCouponItem(dataSource, setup.coupon, setup.item);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);
    });
  });

  describe('redemption limits', () => {
    it('400s when the order is below the code minimum amount', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { minimumAmount: 5000 },
      });

      const response = await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            base_order_value: 100,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(400);

      expect(response.body.message).toContain('greater than');
    });

    it('succeeds when the order exactly meets the minimum amount', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { minimumAmount: 1000 },
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            base_order_value: 1000,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);
    });

    it('409s when the customer has hit their per-customer cap', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptionPerCustomer: 1 },
      });

      const payload = body({
        code: setup.couponCode.code,
        external_customer_id: setup.customer.externalId,
        external_item_id: setup.item.externalId,
      });

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(payload)
        .expect(409);
    });

    it('lets a second customer redeem a code with a per-customer cap of one', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptionPerCustomer: 1 },
      });
      const secondCustomer = await createCustomer(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: secondCustomer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);
    });
  });

  describe('request validation', () => {
    it('rejects a body missing the code', async () => {
      const payload = body();
      delete (payload as Record<string, unknown>).code;

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(payload)
        .expect(400);
    });

    it('rejects a non-numeric order value', async () => {
      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(body({ base_order_value: 'lots' }))
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(body({ extra: true }))
        .expect(400);
    });

    it('still requires authentication', async () => {
      await request(app.getHttpServer())
        .post(redeemUrl())
        .send(body())
        .expect(401);
    });
  });

  describe('GET /redemptions', () => {
    it('lists redemptions for the organization', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .post(redeemUrl())
        .set(...auth)
        .send(
          body({
            code: setup.couponCode.code,
            external_customer_id: setup.customer.externalId,
            external_item_id: setup.item.externalId,
          }),
        )
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}/redemptions`)
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(
        setup.couponCode.code,
      );
    });

    it('filters redemptions by coupon id', async () => {
      const mine = await createRedeemableSetup(dataSource, organization);
      const other = await createRedeemableSetup(dataSource, organization);
      const otherItem = await createItem(dataSource, organization);

      for (const setup of [mine, other]) {
        await request(app.getHttpServer())
          .post(redeemUrl())
          .set(...auth)
          .send(
            body({
              code: setup.couponCode.code,
              external_customer_id: setup.customer.externalId,
              external_item_id: setup.item.externalId,
            }),
          )
          .expect(201);
      }
      expect(otherItem).toBeDefined();

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}/redemptions`)
        .query({ coupon_id: mine.coupon.couponId })
        .set(...auth)
        .expect(200);

      const serialized = JSON.stringify(response.body.data);
      expect(serialized).toContain(mine.couponCode.code);
      expect(serialized).not.toContain(other.couponCode.code);
    });
  });
});
