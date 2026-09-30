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
  createCustomerCouponCode,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { Organization } from '../../src/entities/organization.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  discountTypeEnum,
  durationTypeEnum,
  itemConstraintEnum,
  roleEnum,
  visibilityEnum,
} from '../../src/enums';

/**
 * Offers are served from the `offer` SQL view, whose WHERE clause already
 * filters to active, unexpired coupon codes. These cases pin both halves: what
 * the view itself excludes, and the eligibility checks OffersService layers on
 * top for a specific item or customer.
 *
 * The view is a plain view, not materialized, so it reflects rows written
 * inside the test transaction without needing a refresh.
 */
describe('offers (e2e)', () => {
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

  const offersUrl = () =>
    `/api/organizations/${organization.organizationId}/offers`;
  const offerUrl = () =>
    `/api/organizations/${organization.organizationId}/offer`;

  describe('GET /offers', () => {
    it('lists a public, active, unexpired code', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(
        setup.couponCode.code,
      );
    });

    it('omits private codes', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { visibility: visibilityEnum.PRIVATE },
      });

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain(
        setup.couponCode.code,
      );
    });

    it('omits inactive codes', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { status: couponCodeStatusEnum.INACTIVE },
      });

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain(
        setup.couponCode.code,
      );
    });

    it('omits expired codes', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          durationType: durationTypeEnum.LIMITED,
          expiresAt: new Date(Date.now() - 60_000),
        },
      });

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain(
        setup.couponCode.code,
      );
    });

    it('omits offers belonging to another organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      const foreign = await createRedeemableSetup(dataSource, otherOrg);

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain(
        foreign.couponCode.code,
      );
    });

    it('filters by discount type', async () => {
      const percentage = await createRedeemableSetup(dataSource, organization, {
        coupon: { discountType: discountTypeEnum.PERCENTAGE },
      });
      const fixed = await createRedeemableSetup(dataSource, organization, {
        coupon: { discountType: discountTypeEnum.FIXED },
      });

      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .query({ discount_type: discountTypeEnum.FIXED })
        .set(...auth)
        .expect(200);

      const serialized = JSON.stringify(response.body.data);
      expect(serialized).toContain(fixed.couponCode.code);
      expect(serialized).not.toContain(percentage.couponCode.code);
    });

    it('returns an empty payload rather than an error when there are none', async () => {
      const response = await request(app.getHttpServer())
        .get(offersUrl())
        .set(...auth)
        .expect(200);

      expect(response.body.code).toBe(200);
    });
  });

  describe('GET /offer', () => {
    it('returns the offer matching the code', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      const response = await request(app.getHttpServer())
        .get(offerUrl())
        .query({
          code: setup.couponCode.code,
          external_customer_id: setup.customer.externalId,
          external_item_id: setup.item.externalId,
        })
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(
        setup.couponCode.code,
      );
    });

    it('404s for a code that is not an offer', async () => {
      await createRedeemableSetup(dataSource, organization);

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({ code: 'NOSUCHCODE' })
        .set(...auth)
        .expect(404);
    });

    it('404s for a code belonging to another organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      const foreign = await createRedeemableSetup(dataSource, otherOrg);

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({ code: foreign.couponCode.code })
        .set(...auth)
        .expect(404);
    });

    it('409s when the coupon is item-restricted and the item is ineligible', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({
          code: setup.couponCode.code,
          external_item_id: setup.item.externalId,
          external_customer_id: setup.customer.externalId,
        })
        .set(...auth)
        .expect(409);
    });

    it('returns the offer when the restricted coupon includes the item', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });
      await createCouponItem(dataSource, setup.coupon, setup.item);

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({
          code: setup.couponCode.code,
          external_item_id: setup.item.externalId,
          external_customer_id: setup.customer.externalId,
        })
        .set(...auth)
        .expect(200);
    });

    it('409s when the code is customer-restricted and the customer is not linked', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { customerConstraint: customerConstraintEnum.SPECIFIC },
      });

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({
          code: setup.couponCode.code,
          external_customer_id: setup.customer.externalId,
          external_item_id: setup.item.externalId,
        })
        .set(...auth)
        .expect(409);
    });

    it('returns the offer when the restricted code is linked to the customer', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { customerConstraint: customerConstraintEnum.SPECIFIC },
      });
      await createCustomerCouponCode(
        dataSource,
        setup.customer,
        setup.couponCode,
      );

      await request(app.getHttpServer())
        .get(offerUrl())
        .query({
          code: setup.couponCode.code,
          external_customer_id: setup.customer.externalId,
          external_item_id: setup.item.externalId,
        })
        .set(...auth)
        .expect(200);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .get(offerUrl())
        .query({ code: 'ANY' })
        .expect(401);
    });
  });
});
