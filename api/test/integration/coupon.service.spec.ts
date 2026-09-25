import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCampaign,
  createCoupon,
  createCouponItem,
  createItem,
  createOrganization,
} from '../support/factories';
import { CouponService } from '../../src/services/coupon.service';
import { Campaign } from '../../src/entities/campaign.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { Organization } from '../../src/entities/organization.entity';
import {
  campaignStatusEnum,
  discountTypeEnum,
  itemConstraintEnum,
  statusEnum,
} from '../../src/enums';

/**
 * CouponService against a real Postgres.
 *
 * What belongs here rather than in the unit spec: anything whose correctness
 * is a property of the SQL. `Raw((alias) => 'LOWER(...)')` name matching,
 * `Not(ARCHIVE)` filtering, `ILike` partial search and the multi-table
 * archive cascades all pass a mocked repository trivially while being wrong
 * against a database.
 */
describe('CouponService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CouponService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CouponService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
  });

  describe('name uniqueness', () => {
    it('matches an existing name case-insensitively', async () => {
      await createCoupon(dataSource, organization, { name: 'Diwali Sale' });

      await expect(
        service.createCoupon(organization.organizationId, {
          entity: 'org.quicko.qpon.coupon',
          name: 'dIwAlI sAlE',
          discountType: discountTypeEnum.PERCENTAGE,
          discountValue: 10,
          discountUpto: null as never,
          itemConstraint: itemConstraintEnum.ALL,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('ignores archived coupons when checking for a duplicate name', async () => {
      await createCoupon(dataSource, organization, {
        name: 'Recycled',
        status: statusEnum.ARCHIVE,
      });

      const created = await service.createCoupon(organization.organizationId, {
        entity: 'org.quicko.qpon.coupon',
        name: 'Recycled',
        discountType: discountTypeEnum.PERCENTAGE,
        discountValue: 10,
        discountUpto: null as never,
        itemConstraint: itemConstraintEnum.ALL,
      });

      expect(created).toBeDefined();
    });

    it('scopes the duplicate check to the organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCoupon(dataSource, otherOrg, { name: 'Shared Name' });

      const created = await service.createCoupon(organization.organizationId, {
        entity: 'org.quicko.qpon.coupon',
        name: 'Shared Name',
        discountType: discountTypeEnum.PERCENTAGE,
        discountValue: 10,
        discountUpto: null as never,
        itemConstraint: itemConstraintEnum.ALL,
      });

      expect(created).toBeDefined();
    });
  });

  describe('fetchCoupons filtering', () => {
    it('matches a name substring case-insensitively via ILike', async () => {
      await createCoupon(dataSource, organization, { name: 'Monsoon Bonanza' });
      await createCoupon(dataSource, organization, { name: 'Winter Special' });

      const result = await service.fetchCoupons(
        organization.organizationId,
        0,
        10,
        { name: 'bonan' },
      );

      const serialized = JSON.stringify(result);
      expect(serialized).toContain('Monsoon Bonanza');
      expect(serialized).not.toContain('Winter Special');
    });

    it('omits archived coupons from an unfiltered listing', async () => {
      await createCoupon(dataSource, organization, { name: 'Visible' });
      await createCoupon(dataSource, organization, {
        name: 'Hidden',
        status: statusEnum.ARCHIVE,
      });

      const result = await service.fetchCoupons(organization.organizationId);

      const serialized = JSON.stringify(result);
      expect(serialized).toContain('Visible');
      expect(serialized).not.toContain('Hidden');
    });

    it('filters by the related item external id across the join', async () => {
      const item = await createItem(dataSource, organization, {
        externalId: 'sku-42',
      });
      const matching = await createCoupon(dataSource, organization, {
        name: 'Has the item',
      });
      await createCouponItem(dataSource, matching, item);
      await createCoupon(dataSource, organization, { name: 'Unrelated' });

      const result = await service.fetchCoupons(
        organization.organizationId,
        0,
        10,
        { couponItems: { item: { externalId: 'sku-42' } } },
      );

      const serialized = JSON.stringify(result);
      expect(serialized).toContain('Has the item');
      expect(serialized).not.toContain('Unrelated');
    });
  });

  describe('deleteCoupon cascades', () => {
    it('archives the coupon, its campaigns and its coupon codes, and removes its items', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        itemConstraint: itemConstraintEnum.SPECIFIC,
      });
      const item = await createItem(dataSource, organization);
      await createCouponItem(dataSource, coupon, item);
      const campaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );

      await service.deleteCoupon(coupon.couponId);

      const storedCoupon = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(storedCoupon.status).toBe(statusEnum.ARCHIVE);

      const storedCampaign = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(storedCampaign.status).toBe(campaignStatusEnum.ARCHIVE);

      const remainingItems = await dataSource
        .getRepository(CouponItem)
        .countBy({ coupon: { couponId: coupon.couponId } });
      expect(remainingItems).toBe(0);
    });

    it('leaves another coupon’s campaigns untouched', async () => {
      const target = await createCoupon(dataSource, organization);
      const bystander = await createCoupon(dataSource, organization);
      const bystanderCampaign = await createCampaign(
        dataSource,
        organization,
        bystander,
        {},
      );

      await service.deleteCoupon(target.couponId);

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: bystanderCampaign.campaignId });
      expect(stored.status).toBe(campaignStatusEnum.ACTIVE);
    });
  });

  describe('deactivateCoupon cascades', () => {
    it('deactivates the coupon and its active campaigns', async () => {
      const coupon = await createCoupon(dataSource, organization);
      const campaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );

      await service.deactivateCoupon(coupon.couponId);

      const storedCoupon = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(storedCoupon.status).toBe(statusEnum.INACTIVE);

      const storedCampaign = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: campaign.campaignId });
      expect(storedCampaign.status).toBe(campaignStatusEnum.INACTIVE);
    });

    it('does not resurrect an already-archived campaign into inactive', async () => {
      const coupon = await createCoupon(dataSource, organization);
      const archived = await createCampaign(dataSource, organization, coupon, {
        status: campaignStatusEnum.ARCHIVE,
      });

      await service.deactivateCoupon(coupon.couponId);

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: archived.campaignId });
      expect(stored.status).toBe(campaignStatusEnum.ARCHIVE);
    });
  });
});
