import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCampaign,
  createCoupon,
  createCouponCode,
  createCustomer,
  createCustomerCouponCode,
  createOrganization,
} from '../support/factories';
import { CustomerCouponCodeService } from '../../src/services/customer-coupon-code.service';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { Campaign } from '../../src/entities/campaign.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { Organization } from '../../src/entities/organization.entity';

describe('CustomerCouponCodeService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CustomerCouponCodeService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CustomerCouponCodeService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;
  let coupon: Coupon;
  let campaign: Campaign;
  let couponCode: CouponCode;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
    campaign = await createCampaign(dataSource, organization, coupon, {});
    couponCode = await createCouponCode(
      dataSource,
      organization,
      coupon,
      campaign,
    );
  });

  describe('addCustomers', () => {
    it('throws NotFoundException for an unknown coupon code', async () => {
      const customer = await createCustomer(dataSource, organization);

      await expect(
        service.addCustomers(
          coupon.couponId,
          campaign.campaignId,
          '00000000-0000-0000-0000-000000000000',
          {
            entity: 'org.quicko.qpon.customer_coupon_code',
            customers: [customer.customerId],
          } as never,
        ),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('rejects a customer id that does not exist', async () => {
      await expect(
        service.addCustomers(
          coupon.couponId,
          campaign.campaignId,
          couponCode.couponCodeId,
          {
            entity: 'org.quicko.qpon.customer_coupon_code',
            customers: ['00000000-0000-0000-0000-000000000000'],
          } as never,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('links every valid customer to the coupon code', async () => {
      const customerA = await createCustomer(dataSource, organization);
      const customerB = await createCustomer(dataSource, organization);

      await service.addCustomers(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
        {
          entity: 'org.quicko.qpon.customer_coupon_code',
          customers: [customerA.customerId, customerB.customerId],
        } as never,
      );

      expect(
        await dataSource
          .getRepository(CustomerCouponCode)
          .countBy({ couponCodeId: couponCode.couponCodeId }),
      ).toBe(2);
    });
  });

  describe('fetchCustomers', () => {
    it('scopes results to the coupon code', async () => {
      const otherCouponCode = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );
      const kept = await createCustomer(dataSource, organization, {
        name: 'Kept',
      });
      const excluded = await createCustomer(dataSource, organization, {
        name: 'Excluded',
      });
      await createCustomerCouponCode(dataSource, kept, couponCode);
      await createCustomerCouponCode(dataSource, excluded, otherCouponCode);

      const result = await service.fetchCustomers(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('Kept');
      expect(body).not.toContain('Excluded');
    });
  });

  describe('fetchCustomerForValidation', () => {
    it('returns the linked row when a customer has been added', async () => {
      const customer = await createCustomer(dataSource, organization);
      await createCustomerCouponCode(dataSource, customer, couponCode);

      const result = await service.fetchCustomerForValidation(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
      );

      expect(result?.couponCodeId).toBe(couponCode.couponCodeId);
    });

    // Regression guard: an empty allow-list used to make this return null,
    // and CASL's detectSubjectType throws on null, turning a legitimate first
    // add-customer call into a blanket 403.
    it('falls back to a subject carrying the coupon code when nobody has been added yet', async () => {
      const result = await service.fetchCustomerForValidation(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
      );

      expect(result).not.toBeNull();
      expect(result?.couponCodeId).toBe(couponCode.couponCodeId);
      expect(result?.couponCode?.organization?.organizationId).toBe(
        organization.organizationId,
      );
    });

    it('returns null when the coupon code itself does not exist', async () => {
      const result = await service.fetchCustomerForValidation(
        coupon.couponId,
        campaign.campaignId,
        '00000000-0000-0000-0000-000000000000',
      );

      expect(result).toBeNull();
    });
  });

  describe('updateCustomers', () => {
    it('replaces the full customer set rather than appending to it', async () => {
      const original = await createCustomer(dataSource, organization, {
        name: 'Original',
      });
      const replacement = await createCustomer(dataSource, organization, {
        name: 'Replacement',
      });
      await createCustomerCouponCode(dataSource, original, couponCode);

      await service.updateCustomers(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
        {
          entity: 'org.quicko.qpon.customer_coupon_code',
          customers: [replacement.customerId],
        } as never,
      );

      const links = await dataSource.getRepository(CustomerCouponCode).find({
        where: { couponCodeId: couponCode.couponCodeId },
      });
      expect(links).toHaveLength(1);
      expect(links[0].customerId).toBe(replacement.customerId);
    });

    it('throws NotFoundException for an unknown coupon code', async () => {
      const customer = await createCustomer(dataSource, organization);

      await expect(
        service.updateCustomers(
          coupon.couponId,
          campaign.campaignId,
          '00000000-0000-0000-0000-000000000000',
          {
            entity: 'org.quicko.qpon.customer_coupon_code',
            customers: [customer.customerId],
          } as never,
        ),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('removeCustomer', () => {
    it('removes only the targeted link', async () => {
      const target = await createCustomer(dataSource, organization);
      const bystander = await createCustomer(dataSource, organization);
      await createCustomerCouponCode(dataSource, target, couponCode);
      await createCustomerCouponCode(dataSource, bystander, couponCode);

      await service.removeCustomer(
        coupon.couponId,
        campaign.campaignId,
        couponCode.couponCodeId,
        target.customerId,
      );

      const remaining = await dataSource
        .getRepository(CustomerCouponCode)
        .find({ where: { couponCodeId: couponCode.couponCodeId } });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].customerId).toBe(bystander.customerId);
    });
  });
});
