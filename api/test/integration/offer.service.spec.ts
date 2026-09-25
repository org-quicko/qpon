import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCouponItem,
  createCustomer,
  createCustomerCouponCode,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { OffersService } from '../../src/services/offer.service';
import { RedemptionsService } from '../../src/services/redemption.service';
import { Offer } from '../../src/entities/offer.view';
import { Organization } from '../../src/entities/organization.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  itemConstraintEnum,
  visibilityEnum,
} from '../../src/enums';

/**
 * The `offer` view is where most of this feature's logic actually lives — its
 * WHERE clause decides what is on offer at all, and it joins five tables to do
 * it. These cases target the view directly as well as through the service, so
 * a change to the SQL in a migration shows up here rather than as a puzzling
 * empty list in the e2e suite.
 */
describe('OffersService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: OffersService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(OffersService);
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

  describe('the view itself', () => {
    it('exposes an active, unexpired code', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);

      const rows = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(rows).not.toHaveLength(0);
    });

    it.each([
      couponCodeStatusEnum.INACTIVE,
      couponCodeStatusEnum.EXPIRED,
      couponCodeStatusEnum.REDEEMED,
      couponCodeStatusEnum.ARCHIVE,
    ])('excludes a code whose status is %s', async (status) => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { status },
      });

      const rows = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(rows).toHaveLength(0);
    });

    it('excludes a code whose expiry has passed', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          durationType: durationTypeEnum.LIMITED,
          expiresAt: new Date(Date.now() - 60_000),
        },
      });

      const rows = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(rows).toHaveLength(0);
    });

    it('includes a code with a future expiry', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          durationType: durationTypeEnum.LIMITED,
          expiresAt: new Date(Date.now() + 3_600_000),
        },
      });

      const rows = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(rows).not.toHaveLength(0);
    });

    it('includes a private code — visibility is filtered by the service, not the view', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { visibility: visibilityEnum.PRIVATE },
      });

      const rows = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(rows).not.toHaveLength(0);

      // fetchOffers adds `visibility: PUBLIC`, which is what keeps a private
      // code out of the listing.
      const listed = await service.fetchOffers(organization.organizationId);
      expect(JSON.stringify(listed)).not.toContain(setup.couponCode.code);
    });

    it('carries the coupon discount through to the offer row', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { discountValue: 35 },
      });

      const [row] = await dataSource
        .getRepository(Offer)
        .findBy({ code: setup.couponCode.code });
      expect(Number(row.discountValue)).toBe(35);
    });
  });

  describe('fetchOffers', () => {
    it('returns offers for the given organization only', async () => {
      const mine = await createRedeemableSetup(dataSource, organization);
      const otherOrg = await createOrganization(dataSource);
      const theirs = await createRedeemableSetup(dataSource, otherOrg);

      const result = await service.fetchOffers(organization.organizationId);

      const body = JSON.stringify(result);
      expect(body).toContain(mine.couponCode.code);
      expect(body).not.toContain(theirs.couponCode.code);
    });

    it('returns an empty payload when the organization has none', async () => {
      const result = await service.fetchOffers(organization.organizationId);
      expect(result).toBeDefined();
    });
  });

  describe('fetchOffer eligibility', () => {
    it('rejects an ineligible item on an item-restricted coupon', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });

      await expect(
        service.fetchOffer(
          organization.organizationId,
          setup.couponCode.code,
          setup.customer.externalId,
          setup.item.externalId,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('accepts an item that is linked to the coupon', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        coupon: { itemConstraint: itemConstraintEnum.SPECIFIC },
      });
      await createCouponItem(dataSource, setup.coupon, setup.item);

      await expect(
        service.fetchOffer(
          organization.organizationId,
          setup.couponCode.code,
          setup.customer.externalId,
          setup.item.externalId,
        ),
      ).resolves.toBeDefined();
    });

    it('rejects an unlinked customer on a customer-restricted code', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { customerConstraint: customerConstraintEnum.SPECIFIC },
      });

      await expect(
        service.fetchOffer(
          organization.organizationId,
          setup.couponCode.code,
          setup.customer.externalId,
          setup.item.externalId,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects the offer once the customer has hit the per-customer cap', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: { maxRedemptionPerCustomer: 1 },
      });

      await app.get(RedemptionsService).redeemCouponCode(
        organization.organizationId,
        {
          entity: 'org.quicko.qpon.redemption',
          code: setup.couponCode.code,
          baseOrderValue: 1000,
          discount: 100,
          externalCustomerId: setup.customer.externalId,
          externalItemId: setup.item.externalId,
        } as never,
      );

      await expect(
        service.fetchOffer(
          organization.organizationId,
          setup.couponCode.code,
          setup.customer.externalId,
          setup.item.externalId,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('still offers the code to a customer who has not redeemed it', async () => {
      const setup = await createRedeemableSetup(dataSource, organization, {
        couponCode: {
          maxRedemptionPerCustomer: 1,
          customerConstraint: customerConstraintEnum.SPECIFIC,
        },
      });
      const other = await createCustomer(dataSource, organization);
      await createCustomerCouponCode(dataSource, other, setup.couponCode);

      await expect(
        service.fetchOffer(
          organization.organizationId,
          setup.couponCode.code,
          other.externalId,
          setup.item.externalId,
        ),
      ).resolves.toBeDefined();
    });
  });
});
