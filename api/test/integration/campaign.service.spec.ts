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
import { CampaignService } from '../../src/services/campaign.service';
import { Campaign } from '../../src/entities/campaign.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import { campaignStatusEnum, couponCodeStatusEnum } from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.campaign',
    name: 'Campaign under test',
    budget: 1000,
    externalId: null,
    ...overrides,
  }) as never;

describe('CampaignService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CampaignService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CampaignService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;
  let coupon: Coupon;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
  });

  describe('name uniqueness on create', () => {
    it('matches an existing name case-insensitively', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Festive Blast',
      });

      await expect(
        service.createCampaign(
          organization.organizationId,
          coupon.couponId,
          createDto({ name: 'festive blast' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('ignores archived campaigns when checking the name', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Recycled',
        status: campaignStatusEnum.ARCHIVE,
      });

      await expect(
        service.createCampaign(
          organization.organizationId,
          coupon.couponId,
          createDto({ name: 'Recycled' }),
        ),
      ).resolves.toBeDefined();
    });

    it('scopes the check to the coupon, so another coupon may reuse the name', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      await createCampaign(dataSource, organization, otherCoupon, {
        name: 'Shared',
      });

      await expect(
        service.createCampaign(
          organization.organizationId,
          coupon.couponId,
          createDto({ name: 'Shared' }),
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('name uniqueness on update', () => {
    it('rejects a rename onto a sibling campaign of the same coupon', async () => {
      await createCampaign(dataSource, organization, coupon, { name: 'Taken' });
      const target = await createCampaign(dataSource, organization, coupon, {
        name: 'Mine',
      });

      await expect(
        service.updateCampaign(target.campaignId, createDto({ name: 'Taken' })),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows renaming a campaign to the name it already holds', async () => {
      const target = await createCampaign(dataSource, organization, coupon, {
        name: 'Unchanged',
      });

      await expect(
        service.updateCampaign(
          target.campaignId,
          createDto({ name: 'Unchanged' }),
        ),
      ).resolves.toBeDefined();
    });

    // Documents an asymmetry rather than asserting it is desirable: createCampaign
    // scopes its duplicate-name lookup to `coupon: { couponId }`
    // (campaign.service.ts:56-64) while updateCampaign omits that scope
    // (campaign.service.ts:254-262), matching on name across every coupon in
    // every organization. A name that is free to create is therefore not
    // always free to rename onto.
    it('rejects a rename onto a name used by an unrelated organization', async () => {
      const foreignOrg = await createOrganization(dataSource);
      const foreignCoupon = await createCoupon(dataSource, foreignOrg);
      await createCampaign(dataSource, foreignOrg, foreignCoupon, {
        name: 'Global Name',
      });

      const target = await createCampaign(dataSource, organization, coupon, {
        name: 'Local Name',
      });

      // Creating this same name here is allowed...
      await expect(
        service.createCampaign(
          organization.organizationId,
          coupon.couponId,
          createDto({ name: 'Global Name 2' }),
        ),
      ).resolves.toBeDefined();

      // ...but renaming onto the foreign organization's name is not.
      await expect(
        service.updateCampaign(
          target.campaignId,
          createDto({ name: 'Global Name' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('fetchCampaigns filtering', () => {
    it('returns campaigns for the coupon only', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      await createCampaign(dataSource, organization, coupon, { name: 'Kept' });
      await createCampaign(dataSource, organization, otherCoupon, {
        name: 'Excluded',
      });

      const result = await service.fetchCampaigns(coupon.couponId);

      const body = JSON.stringify(result);
      expect(body).toContain('Kept');
      expect(body).not.toContain('Excluded');
    });

    it('treats budgeted=true as budget greater than zero', async () => {
      await createCampaign(dataSource, organization, coupon, {
        name: 'Funded',
        budget: 1,
      });
      await createCampaign(dataSource, organization, coupon, {
        name: 'Zero budget',
        budget: 0,
      });
      await createCampaign(dataSource, organization, coupon, {
        name: 'Null budget',
      });

      const result = await service.fetchCampaigns(
        coupon.couponId,
        undefined,
        true,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('Funded');
      expect(body).not.toContain('Zero budget');
      expect(body).not.toContain('Null budget');
    });
  });

  describe('deactivateCampaign cascade', () => {
    it('deactivates coupon codes that are not archived', async () => {
      const campaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      const active = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );
      const archived = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
        { status: couponCodeStatusEnum.ARCHIVE },
      );

      await service.deactivateCampaign(campaign.campaignId);

      const codes = dataSource.getRepository(CouponCode);
      expect(
        (await codes.findOneByOrFail({ couponCodeId: active.couponCodeId }))
          .status,
      ).toBe(couponCodeStatusEnum.INACTIVE);

      // An archived code must stay archived — reviving it to inactive would
      // make a deleted code selectable again.
      expect(
        (await codes.findOneByOrFail({ couponCodeId: archived.couponCodeId }))
          .status,
      ).toBe(couponCodeStatusEnum.ARCHIVE);
    });

    it('leaves another campaign’s codes untouched', async () => {
      const target = await createCampaign(dataSource, organization, coupon, {});
      const bystander = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      const bystanderCode = await createCouponCode(
        dataSource,
        organization,
        coupon,
        bystander,
      );

      await service.deactivateCampaign(target.campaignId);

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: bystanderCode.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.ACTIVE);
    });
  });

  describe('deleteCampaign', () => {
    it('archives the campaign and its coupon codes', async () => {
      const campaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      const code = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );

      await service.deleteCampaign(coupon.couponId, campaign.campaignId);

      expect(
        (
          await dataSource
            .getRepository(Campaign)
            .findOneByOrFail({ campaignId: campaign.campaignId })
        ).status,
      ).toBe(campaignStatusEnum.ARCHIVE);
      expect(
        (
          await dataSource
            .getRepository(CouponCode)
            .findOneByOrFail({ couponCodeId: code.couponCodeId })
        ).status,
      ).toBe(couponCodeStatusEnum.ARCHIVE);
    });

    // Issue 9 in issues.md: the method issues two UPDATEs and returns, and an
    // UPDATE matching zero rows is not an error — so a non-existent campaign
    // is "deleted" successfully at the service level. Reached over HTTP the
    // request still 404s, because PermissionGuard resolves `delete` through
    // fetchCampaignForValidation first.
    it('does not raise for a campaign id that does not exist', async () => {
      await expect(
        service.deleteCampaign(
          coupon.couponId,
          '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
        ),
      ).resolves.not.toThrow();
    });
  });
});
