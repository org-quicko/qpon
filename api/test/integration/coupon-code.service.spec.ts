import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCampaign,
  createCoupon,
  createCouponCode,
  createOrganization,
} from '../support/factories';
import { CouponCodeService } from '../../src/services/coupon-code.service';
import { Campaign } from '../../src/entities/campaign.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  visibilityEnum,
} from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.coupon_code',
    code: 'CODEUNDERTEST',
    customerConstraint: customerConstraintEnum.ALL,
    visibility: visibilityEnum.PUBLIC,
    durationType: durationTypeEnum.FOREVER,
    ...overrides,
  }) as never;

describe('CouponCodeService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CouponCodeService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CouponCodeService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;
  let coupon: Coupon;
  let campaign: Campaign;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
    campaign = await createCampaign(dataSource, organization, coupon, {});
  });

  describe('coupon/campaign consistency', () => {
    it('rejects a campaign that belongs to a different coupon', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      const foreignCampaign = await createCampaign(
        dataSource,
        organization,
        otherCoupon,
        {},
      );

      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          foreignCampaign.campaignId,
          createDto(),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('accepts a campaign that belongs to the coupon', async () => {
      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          campaign.campaignId,
          createDto(),
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('code uniqueness', () => {
    // The lookup filters on `status: ACTIVE` exactly, so only a live code
    // reserves its value — inactive, expired, redeemed and archived ones all
    // release it.
    it('rejects a value already held by an active code in the organization', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'TAKEN',
      });

      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          campaign.campaignId,
          createDto({ code: 'TAKEN' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it.each([
      couponCodeStatusEnum.INACTIVE,
      couponCodeStatusEnum.EXPIRED,
      couponCodeStatusEnum.REDEEMED,
      couponCodeStatusEnum.ARCHIVE,
    ])('releases the value when the holder is %s', async (status) => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'RECYCLED',
        status,
      });

      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          campaign.campaignId,
          createDto({ code: 'RECYCLED' }),
        ),
      ).resolves.toBeDefined();
    });

    it('is case sensitive, unlike coupon and campaign names', async () => {
      // Coupon and campaign both compare names with LOWER(...); coupon codes
      // compare the raw value, so casing distinguishes two codes here.
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'MixedCase',
      });

      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          campaign.campaignId,
          createDto({ code: 'mixedcase' }),
        ),
      ).resolves.toBeDefined();
    });

    it('scopes the check to the organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      const otherCoupon = await createCoupon(dataSource, otherOrg);
      const otherCampaign = await createCampaign(
        dataSource,
        otherOrg,
        otherCoupon,
        {},
      );
      await createCouponCode(dataSource, otherOrg, otherCoupon, otherCampaign, {
        code: 'SHARED',
      });

      await expect(
        service.createCouponCode(
          organization.organizationId,
          coupon.couponId,
          campaign.campaignId,
          createDto({ code: 'SHARED' }),
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('fetchCouponCodes filtering', () => {
    it('matches a code substring case-insensitively via ILike', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'MONSOON50',
      });
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'WINTER50',
      });

      const result = await service.fetchCouponCodes(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
        undefined,
        undefined,
        10,
        0,
        { code: 'monsoon' },
      );

      const body = JSON.stringify(result);
      expect(body).toContain('MONSOON50');
      expect(body).not.toContain('WINTER50');
    });

    it('excludes archived codes unless a status is given', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'LIVE',
      });
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'ARCHIVED',
        status: couponCodeStatusEnum.ARCHIVE,
      });

      const result = await service.fetchCouponCodes(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('LIVE');
      expect(body).not.toContain('ARCHIVED');
    });

    it('returns archived codes when that status is asked for explicitly', async () => {
      await createCouponCode(dataSource, organization, coupon, campaign, {
        code: 'ARCHIVED',
        status: couponCodeStatusEnum.ARCHIVE,
      });

      const result = await service.fetchCouponCodes(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
        undefined,
        undefined,
        10,
        0,
        { status: couponCodeStatusEnum.ARCHIVE },
      );

      expect(JSON.stringify(result)).toContain('ARCHIVED');
    });

    it('does not leak codes from another campaign on the same coupon', async () => {
      const siblingCampaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      await createCouponCode(
        dataSource,
        organization,
        coupon,
        siblingCampaign,
        { code: 'SIBLING' },
      );

      const result = await service.fetchCouponCodes(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
      );

      expect(JSON.stringify(result)).not.toContain('SIBLING');
    });
  });

  describe('deleteCouponCode', () => {
    it('archives the code rather than deleting the row', async () => {
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await service.deleteCouponCode(
        organization.organizationId,
        coupon.couponId,
        campaign.campaignId,
        code.couponCodeId,
      );

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: code.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.ARCHIVE);
    });
  });
});
