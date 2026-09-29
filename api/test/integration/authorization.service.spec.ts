import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { createUserWithRole } from '../support/auth';
import {
  createCampaign,
  createCoupon,
  createCouponCode,
  createCouponItem,
  createCustomer,
  createCustomerCouponCode,
  createItem,
  createOrganization,
} from '../support/factories';
import { AuthorizationService } from '../../src/services/authorization.service';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { ApiKey } from '../../src/entities/api-key.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

const fakeRequest = (params: Record<string, string | undefined>) => ({
  params,
});

describe('AuthorizationService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: AuthorizationService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(AuthorizationService);
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

  describe('getSubjectTypes(CouponItem)', () => {
    // Regression guard: CouponItem had no branch at all, so the bare-class
    // fallback authorized every action in any organization. The subject must
    // resolve through the real coupon's organization, not the path's.
    it('resolves the subject against the coupon’s real organization, ignoring a spoofed path org', async () => {
      const foreignOrg = await createOrganization(dataSource);

      const [subject] = await service.getSubjectTypes(
        fakeRequest({
          organization_id: foreignOrg.organizationId,
          coupon_id: coupon.couponId,
        }),
        [{ action: 'manage', subject: CouponItem }],
      );

      expect((subject as CouponItem).coupon.organization.organizationId).toBe(
        organization.organizationId,
      );
    });

    it('throws BadRequestException without a coupon id', async () => {
      await expect(
        service.getSubjectTypes(fakeRequest({}), [
          { action: 'manage', subject: CouponItem },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getSubjectTypes(CustomerCouponCode)', () => {
    it('resolves through the real coupon code, scoped by its own organization', async () => {
      const campaign = await createCampaign(
        dataSource,
        organization,
        coupon,
        {},
      );
      const couponCode = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );
      const customer = await createCustomer(dataSource, organization);
      await createCustomerCouponCode(dataSource, customer, couponCode);

      const [subject] = await service.getSubjectTypes(
        fakeRequest({
          coupon_id: coupon.couponId,
          campaign_id: campaign.campaignId,
          coupon_code_id: couponCode.couponCodeId,
        }),
        [{ action: 'manage', subject: CustomerCouponCode }],
      );

      expect(
        (subject as CustomerCouponCode).couponCode.organization.organizationId,
      ).toBe(organization.organizationId);
    });

    it('throws BadRequestException without the full id chain', async () => {
      await expect(
        service.getSubjectTypes(fakeRequest({ coupon_id: coupon.couponId }), [
          { action: 'manage', subject: CustomerCouponCode },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getSubjectTypes(ApiKey)', () => {
    it('scopes create/read to the path organization even with no key yet', async () => {
      const [subject] = await service.getSubjectTypes(
        fakeRequest({ organization_id: organization.organizationId }),
        [{ action: 'read', subject: ApiKey }],
      );

      expect((subject as ApiKey).organization.organizationId).toBe(
        organization.organizationId,
      );
    });

    it('throws BadRequestException for update/delete without an organization id', async () => {
      await expect(
        service.getSubjectTypes(fakeRequest({}), [
          { action: 'delete', subject: ApiKey },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getUserAbility', () => {
    it('lets an ADMIN manage a coupon item scoped to their organization', async () => {
      const admin = await createUserWithRole(dataSource, {
        role: roleEnum.ADMIN,
        organization,
      });
      const item = await createItem(dataSource, organization);
      await createCouponItem(dataSource, coupon, item);
      const loaded = await dataSource.getRepository(CouponItem).findOneOrFail({
        relations: { coupon: { organization: true } },
        where: { couponId: coupon.couponId, itemId: item.itemId },
      });

      const ability = service.getUserAbility(admin);

      expect(ability.can('manage', loaded)).toBe(true);
    });

    it("denies an ADMIN managing another organization's coupon item", async () => {
      const admin = await createUserWithRole(dataSource, {
        role: roleEnum.ADMIN,
        organization,
      });
      const foreignOrg = await createOrganization(dataSource);
      const foreignCoupon = await createCoupon(dataSource, foreignOrg);
      const foreignItem = await createItem(dataSource, foreignOrg);
      await createCouponItem(dataSource, foreignCoupon, foreignItem);
      const loaded = await dataSource.getRepository(CouponItem).findOneOrFail({
        relations: { coupon: { organization: true } },
        where: { couponId: foreignCoupon.couponId, itemId: foreignItem.itemId },
      });

      const ability = service.getUserAbility(admin);

      expect(ability.can('manage', loaded)).toBe(false);
    });

    it('denies an EDITOR from managing (only reading) an ApiKey', async () => {
      const editor = await createUserWithRole(dataSource, {
        role: roleEnum.EDITOR,
        organization,
      });
      const apiKey = Object.create(ApiKey.prototype) as ApiKey;
      apiKey.organization = organization;

      const ability = service.getUserAbility(editor);

      expect(ability.can('read', apiKey)).toBe(true);
      expect(ability.can('manage', apiKey)).toBe(false);
    });
  });
});
