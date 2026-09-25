import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import {
  INestApplication,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCustomer,
  createItem,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { RedemptionsService } from '../../src/services/redemption.service';
import { Campaign } from '../../src/entities/campaign.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Redemption } from '../../src/entities/redemption.entity';
import { Organization } from '../../src/entities/organization.entity';
import { campaignStatusEnum, couponCodeStatusEnum } from '../../src/enums';

const dto = (overrides: Record<string, unknown>) =>
  ({
    entity: 'org.quicko.qpon.redemption',
    baseOrderValue: 1000,
    discount: 100,
    ...overrides,
  }) as never;

/**
 * Redemption side effects that only exist at the database level: the counter
 * increment, the campaign-budget exhaustion cascade, and the interaction
 * between concurrent-looking sequential redemptions and the caps.
 */
describe('RedemptionsService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: RedemptionsService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(RedemptionsService);
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

  describe('redemption counter', () => {
    it('increments once per successful redemption', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);
      const secondCustomer = await createCustomer(dataSource, organization);

      for (const customer of [setup.customer, secondCustomer]) {
        await service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: setup.couponCode.code,
            externalCustomerId: customer.externalId,
            externalItemId: setup.item.externalId,
          }),
        );
      }

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: setup.couponCode.couponCodeId });
      expect(stored.redemptionCount).toBe(2);
    });

    it('does not increment when a validation rejects the redemption', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { minimumAmount: 10_000 },
      });

      await expect(
        service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: setup.couponCode.code,
            baseOrderValue: 10,
            externalCustomerId: setup.customer.externalId,
            externalItemId: setup.item.externalId,
          }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      // The increment happens inside the transaction, before the minimum
      // amount is checked — the rollback is what keeps the counter honest.
      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: setup.couponCode.couponCodeId });
      expect(stored.redemptionCount).toBe(0);
    });

    it('writes no redemption row when validation fails', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await expect(
        service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: setup.couponCode.code,
            externalCustomerId: 'nobody',
            externalItemId: setup.item.externalId,
          }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(await dataSource.getRepository(Redemption).count()).toBe(0);
    });
  });

  describe('per-customer cap', () => {
    it('counts existing redemptions for that customer only', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptionPerCustomer: 2 },
      });

      const payload = dto({
        code: setup.couponCode.code,
        externalCustomerId: setup.customer.externalId,
        externalItemId: setup.item.externalId,
      });

      await service.redeemCouponCode(organization.organizationId, payload);
      await service.redeemCouponCode(organization.organizationId, payload);

      await expect(
        service.redeemCouponCode(organization.organizationId, payload),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(await dataSource.getRepository(Redemption).count()).toBe(2);
    });
  });

  describe('campaign budget exhaustion', () => {
    it('leaves an unbudgeted campaign active however much is redeemed', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await service.redeemCouponCode(
        organization.organizationId,
        dto({
          code: setup.couponCode.code,
          baseOrderValue: 1_000_000,
          discount: 500_000,
          externalCustomerId: setup.customer.externalId,
          externalItemId: setup.item.externalId,
        }),
      );

      const stored = await dataSource
        .getRepository(Campaign)
        .findOneByOrFail({ campaignId: setup.campaign.campaignId });
      expect(stored.status).toBe(campaignStatusEnum.ACTIVE);
    });
  });

  describe('scoping', () => {
    it('refuses a code that belongs to another organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      const foreign = await createRedeemableSetup(dataSource, otherOrg);
      const localItem = await createItem(dataSource, organization);
      const localCustomer = await createCustomer(dataSource, organization);

      await expect(
        service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: foreign.couponCode.code,
            externalCustomerId: localCustomer.externalId,
            externalItemId: localItem.externalId,
          }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('stamps the redemption with the organization from the caller', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      await service.redeemCouponCode(
        organization.organizationId,
        dto({
          code: setup.couponCode.code,
          externalCustomerId: setup.customer.externalId,
          externalItemId: setup.item.externalId,
        }),
      );

      const stored = await dataSource
        .getRepository(Redemption)
        .find({ relations: { organization: true } });
      expect(stored[0].organization.organizationId).toBe(
        organization.organizationId,
      );
    });
  });

  describe('maxRedemptions', () => {
    it('marks the code redeemed once the cap is met', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptions: 2 },
      });
      const second = await createCustomer(dataSource, organization);

      for (const customer of [setup.customer, second]) {
        await service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: setup.couponCode.code,
            externalCustomerId: customer.externalId,
            externalItemId: setup.item.externalId,
          }),
        );
      }

      const stored = await dataSource
        .getRepository(CouponCode)
        .findOneByOrFail({ couponCodeId: setup.couponCode.couponCodeId });
      expect(stored.status).toBe(couponCodeStatusEnum.REDEEMED);
    });

    it('refuses a further redemption once the code is marked redeemed', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptions: 1 },
      });
      const second = await createCustomer(dataSource, organization);

      await service.redeemCouponCode(
        organization.organizationId,
        dto({
          code: setup.couponCode.code,
          externalCustomerId: setup.customer.externalId,
          externalItemId: setup.item.externalId,
        }),
      );

      // The lookup in redeemCouponCode requires status ACTIVE, so a code
      // flipped to REDEEMED is simply not found any more.
      await expect(
        service.redeemCouponCode(
          organization.organizationId,
          dto({
            code: setup.couponCode.code,
            externalCustomerId: second.externalId,
            externalItemId: setup.item.externalId,
          }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
