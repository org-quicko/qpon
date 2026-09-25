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
  campaignStatusEnum,
  couponCodeStatusEnum,
  roleEnum,
} from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('campaigns (e2e)', () => {
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
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const campaignsUrl = () =>
    `/api/organizations/${organization.organizationId}/coupons/${coupon.couponId}/campaigns`;

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.campaign',
    name: 'Autumn push',
    budget: 5000,
    ...overrides,
  });

  describe('POST /campaigns', () => {
    it('creates a campaign under the coupon in the path', async () => {
      const response = await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      expect(response.body).toMatchObject({
        code: 201,
        message: 'Successfully created campaign',
      });

      const stored = await dataSource.getRepository(Campaign).findOne({
        where: { campaignId: response.body.data.campaign_id },
        relations: { coupon: true, organization: true },
      });
      expect(stored?.coupon.couponId).toBe(coupon.couponId);
      expect(stored?.organization.organizationId).toBe(
        organization.organizationId,
      );
      expect(stored?.status).toBe(campaignStatusEnum.ACTIVE);
    });

    it('rejects a duplicate name on the same coupon, case-insensitively', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Autumn push',
      });

      await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send(validBody({ name: 'AUTUMN PUSH' }))
        .expect(409);
    });

    it('allows the same campaign name under a different coupon', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      await createCampaign(dataSource, organization, otherCoupon, {
        name: 'Autumn push',
      });

      await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('accepts a campaign with no budget', async () => {
      await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.campaign', name: 'No budget' })
        .expect(201);
    });

    it('rejects a non-numeric budget', async () => {
      await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send(validBody({ budget: 'a lot' }))
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(campaignsUrl())
        .set(...auth)
        .send(validBody({ sneaky: true }))
        .expect(400);
    });
  });

  describe('GET /campaigns', () => {
    it('returns only campaigns of the coupon in the path', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      await createCampaign(dataSource, organization, coupon, { name: 'Mine' });
      await createCampaign(dataSource, organization, otherCoupon, {
        name: 'Theirs',
      });

      const response = await request(app.getHttpServer())
        .get(campaignsUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Mine');
      expect(body).not.toContain('Theirs');
    });

    it('excludes archived campaigns by default', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Archived one',
        status: campaignStatusEnum.ARCHIVE,
      });

      const response = await request(app.getHttpServer())
        .get(campaignsUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('Archived one');
    });

    it('filters by status', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Running',
        status: campaignStatusEnum.ACTIVE,
      });
      await createCampaign(dataSource, organization, coupon, {
        name: 'Paused',
        status: campaignStatusEnum.INACTIVE,
      });

      const response = await request(app.getHttpServer())
        .get(campaignsUrl())
        .query({ status: campaignStatusEnum.INACTIVE })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Paused');
      expect(body).not.toContain('Running');
    });

    it('returns only budgeted campaigns when budgeted=true', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Has budget',
        budget: 100,
      });
      await createCampaign(dataSource, organization, coupon, {
        name: 'No budget',
      });

      const response = await request(app.getHttpServer())
        .get(campaignsUrl())
        .query({ budgeted: true })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Has budget');
      expect(body).not.toContain('No budget');
    });
  });

  describe('GET /campaigns/:campaign_id', () => {
    it('returns the campaign', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {
        name: 'Fetch me',
      });

      const response = await request(app.getHttpServer())
        .get(`${campaignsUrl()}/${campaign.campaignId}`)
        .set(...auth)
        .expect(200);

      expect(response.body.data).toMatchObject({ name: 'Fetch me' });
    });

    it('404s for an unknown campaign', async () => {
      await request(app.getHttpServer())
        .get(`${campaignsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .expect(404);
    });

    it('404s for an archived campaign', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {
        status: campaignStatusEnum.ARCHIVE,
      });

      await request(app.getHttpServer())
        .get(`${campaignsUrl()}/${campaign.campaignId}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /campaigns/:campaign_id', () => {
    it('updates the budget', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {
        budget: 100,
      });

      await request(app.getHttpServer())
        .patch(`${campaignsUrl()}/${campaign.campaignId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.campaign', budget: 999 })
        .expect(200);

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(Number(stored.budget)).toBe(999);
    });

    it('404s for an unknown campaign', async () => {
      await request(app.getHttpServer())
        .patch(`${campaignsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.campaign', name: 'Whatever' })
        .expect(404);
    });
  });

  describe('POST /campaigns/:campaign_id/deactivate', () => {
    it('deactivates the campaign and its non-archived coupon codes', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {});
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await request(app.getHttpServer())
        .post(`${campaignsUrl()}/${campaign.campaignId}/deactivate`)
        .set(...auth)
        .expect(201);

      const storedCampaign = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(storedCampaign.status).toBe(campaignStatusEnum.INACTIVE);

      const storedCode = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(storedCode.status).toBe(couponCodeStatusEnum.INACTIVE);
    });

    it('404s for an archived campaign', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {
        status: campaignStatusEnum.ARCHIVE,
      });

      await request(app.getHttpServer())
        .post(`${campaignsUrl()}/${campaign.campaignId}/deactivate`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('POST /campaigns/:campaign_id/reactivate', () => {
    it('sets the campaign back to active', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {
        status: campaignStatusEnum.INACTIVE,
      });

      await request(app.getHttpServer())
        .post(`${campaignsUrl()}/${campaign.campaignId}/reactivate`)
        .set(...auth)
        .expect(201);

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(stored.status).toBe(campaignStatusEnum.ACTIVE);
    });
  });

  describe('DELETE /campaigns/:campaign_id', () => {
    it('archives the campaign and its coupon codes', async () => {
      const campaign = await createCampaign(dataSource, organization, coupon, {});
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await request(app.getHttpServer())
        .delete(`${campaignsUrl()}/${campaign.campaignId}`)
        .set(...auth)
        .expect(200);

      const storedCampaign = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(storedCampaign.status).toBe(campaignStatusEnum.ARCHIVE);

      const storedCode = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(storedCode.status).toBe(couponCodeStatusEnum.ARCHIVE);
    });
  });
});
