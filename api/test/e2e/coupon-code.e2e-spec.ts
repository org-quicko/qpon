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
  createCouponCode,
  createOrganization,
} from '../support/factories';
import { Campaign } from '../../src/entities/campaign.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  roleEnum,
  visibilityEnum,
} from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('coupon codes (e2e)', () => {
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
  let coupon: Coupon;
  let campaign: Campaign;
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
    campaign = await createCampaign(dataSource, organization, coupon, {});
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const codesUrl = () =>
    `/api/organizations/${organization.organizationId}/coupons/${coupon.couponId}/campaigns/${campaign.campaignId}/coupon-codes`;

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.coupon_code',
    code: 'SAVE20',
    customer_constraint: customerConstraintEnum.ALL,
    visibility: visibilityEnum.PUBLIC,
    duration_type: durationTypeEnum.FOREVER,
    ...overrides,
  });

  describe('POST /coupon-codes', () => {
    it('creates a code linked to the coupon and campaign in the path', async () => {
      const response = await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      expect(response.body.message).toBe('Successfully created coupon code');

      const stored = await dataSource.getRepository(CouponCode).findOne({
        where: { code: 'SAVE20' },
        relations: { coupon: true, campaign: true, organization: true },
      });
      expect(stored?.coupon.couponId).toBe(coupon.couponId);
      expect(stored?.campaign.campaignId).toBe(campaign.campaignId);
      expect(stored?.organization.organizationId).toBe(
        organization.organizationId,
      );
      expect(stored?.status).toBe(couponCodeStatusEnum.ACTIVE);
      expect(stored?.redemptionCount).toBe(0);
    });

    it('409s when the campaign does not belong to the coupon in the path', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      const foreignCampaign = await createCampaign(
        dataSource,
        organization,
        otherCoupon,
        {},
      );

      await request(app.getHttpServer())
        .post(
          `/api/organizations/${organization.organizationId}/coupons/${coupon.couponId}/campaigns/${foreignCampaign.campaignId}/coupon-codes`,
        )
        .set(...auth)
        .send(validBody())
        .expect(409);
    });

    it('409s when an active code with the same value exists in the organization', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'SAVE20',
      });

      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody())
        .expect(409);
    });

    it('allows reusing a code value that is only held by an inactive code', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'SAVE20',
        status: couponCodeStatusEnum.INACTIVE,
      });

      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('allows the same code value in a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      const otherCoupon = await createCoupon(dataSource, otherOrg);
      const otherCampaign = await createCampaign(
        dataSource,
        otherOrg,
        otherCoupon,
        {},
      );
      await createCouponCode(dataSource, otherOrg, otherCoupon, otherCampaign, {
        code: 'SAVE20',
      });

      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('rejects an unknown visibility', async () => {
      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody({ visibility: 'semi-public' }))
        .expect(400);
    });

    it('rejects an unknown duration type', async () => {
      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody({ duration_type: 'eternal' }))
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(codesUrl())
        .set(...auth)
        .send(validBody({ nope: 1 }))
        .expect(400);
    });
  });

  describe('GET /coupon-codes', () => {
    it('returns only codes of the campaign in the path', async () => {
      const otherCampaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'MINE',
      });
      await createCouponCode(dataSource, organization, coupon, otherCampaign, {
        code: 'THEIRS',
      });

      const response = await request(app.getHttpServer())
        .get(codesUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('MINE');
      expect(body).not.toContain('THEIRS');
    });

    it('excludes archived codes by default', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'GONE',
        status: couponCodeStatusEnum.ARCHIVE,
      });

      const response = await request(app.getHttpServer())
        .get(codesUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('GONE');
    });

    it('filters by code with a partial, case-insensitive match', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'SUMMER10',
      });
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'WINTER10',
      });

      const response = await request(app.getHttpServer())
        .get(codesUrl())
        .query({ code: 'summer' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('SUMMER10');
      expect(body).not.toContain('WINTER10');
    });

    it('filters by visibility', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'PUBLICCODE',
        visibility: visibilityEnum.PUBLIC,
      });
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'PRIVATECODE',
        visibility: visibilityEnum.PRIVATE,
      });

      const response = await request(app.getHttpServer())
        .get(codesUrl())
        .query({ visibility: visibilityEnum.PRIVATE })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('PRIVATECODE');
      expect(body).not.toContain('PUBLICCODE');
    });
  });

  describe('GET /coupon-codes/:coupon_code_id', () => {
    it('returns the code', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
        { code: 'FETCHME' },
      );

      const response = await request(app.getHttpServer())
        .get(`${codesUrl()}/${code.couponCodeId}`)
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain('FETCHME');
    });

    it('404s for an unknown code id', async () => {
      await request(app.getHttpServer())
        .get(`${codesUrl()}/${MISSING_ID}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /coupon-codes/:coupon_code_id/deactivate', () => {
    it('sets an active code to inactive', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await request(app.getHttpServer())
        .patch(`${codesUrl()}/${code.couponCodeId}/deactivate`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.INACTIVE);
    });

    // Regression guard for issue 2: the catch block used to rethrow nothing,
    // turning this BadRequestException into a generic 500.
    it('400s when the code has already been redeemed', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
        { status: couponCodeStatusEnum.REDEEMED },
      );

      const response = await request(app.getHttpServer())
        .patch(`${codesUrl()}/${code.couponCodeId}/deactivate`)
        .set(...auth);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot deactivate');
    });

    it('400s when the code has expired', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
        { status: couponCodeStatusEnum.EXPIRED },
      );

      await request(app.getHttpServer())
        .patch(`${codesUrl()}/${code.couponCodeId}/deactivate`)
        .set(...auth)
        .expect(400);
    });

    it('404s for a code that does not exist', async () => {
      await request(app.getHttpServer())
        .patch(`${codesUrl()}/${MISSING_ID}/deactivate`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /coupon-codes/:coupon_code_id/reactivate', () => {
    it('sets an inactive code back to active', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
        { status: couponCodeStatusEnum.INACTIVE },
      );

      await request(app.getHttpServer())
        .patch(`${codesUrl()}/${code.couponCodeId}/reactivate`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.ACTIVE);
    });
  });

  describe('DELETE /coupon-codes/:coupon_code_id', () => {
    it('archives the code', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await request(app.getHttpServer())
        .delete(`${codesUrl()}/${code.couponCodeId}`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.ARCHIVE);
    });
  });

  describe('GET /organizations/:organization_id/coupon-codes', () => {
    it('looks a code up across campaigns by its value', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'LOOKUPME',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}/coupon-codes`)
        .query({ code: 'LOOKUPME' })
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain('LOOKUPME');
    });
  });
});
