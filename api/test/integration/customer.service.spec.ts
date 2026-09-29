import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
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
import { CustomersService } from '../../src/services/customer.service';
import { Customer } from '../../src/entities/customer.entity';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { Organization } from '../../src/entities/organization.entity';
import { statusEnum } from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.customer',
    name: 'Customer under test',
    email: 'customer@test.local',
    externalId: 'ext-under-test',
    ...overrides,
  }) as never;

describe('CustomersService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CustomersService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CustomersService);
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

  describe('createCustomer', () => {
    it('rejects a duplicate active email in the same organization', async () => {
      await createCustomer(dataSource, organization, {
        email: 'taken@test.local',
      });

      await expect(
        service.createCustomer(
          organization.organizationId,
          createDto({ email: 'taken@test.local' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows reusing an email held only by an inactive customer', async () => {
      await createCustomer(dataSource, organization, {
        email: 'recycled@test.local',
        status: statusEnum.INACTIVE,
      });

      await expect(
        service.createCustomer(
          organization.organizationId,
          createDto({ email: 'recycled@test.local' }),
        ),
      ).resolves.toBeDefined();
    });

    it('allows the same email in a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCustomer(dataSource, otherOrg, {
        email: 'shared@test.local',
      });

      await expect(
        service.createCustomer(
          organization.organizationId,
          createDto({ email: 'shared@test.local' }),
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('fetchCustomers', () => {
    it('excludes inactive customers', async () => {
      await createCustomer(dataSource, organization, { name: 'Live' });
      await createCustomer(dataSource, organization, {
        name: 'Deleted',
        status: statusEnum.INACTIVE,
      });

      const result = await service.fetchCustomers(organization.organizationId);

      const body = JSON.stringify(result);
      expect(body).toContain('Live');
      expect(body).not.toContain('Deleted');
    });

    it('scopes results to the organization', async () => {
      await createCustomer(dataSource, organization, { name: 'Kept' });
      const otherOrg = await createOrganization(dataSource);
      await createCustomer(dataSource, otherOrg, { name: 'Excluded' });

      const result = await service.fetchCustomers(organization.organizationId);

      const body = JSON.stringify(result);
      expect(body).toContain('Kept');
      expect(body).not.toContain('Excluded');
    });

    it('matches an email substring case-insensitively', async () => {
      await createCustomer(dataSource, organization, {
        email: 'Findme@test.local',
      });
      await createCustomer(dataSource, organization, {
        email: 'other@test.local',
      });

      const result = await service.fetchCustomers(
        organization.organizationId,
        0,
        10,
        { email: 'findme' } as never,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('Findme@test.local');
      expect(body).not.toContain('other@test.local');
    });
  });

  describe('deleteCustomer', () => {
    it('throws NotFoundException for an unknown customer', async () => {
      await expect(
        service.deleteCustomer(
          organization.organizationId,
          '00000000-0000-0000-0000-000000000000',
        ),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('deactivates the customer rather than deleting the row', async () => {
      const customer = await createCustomer(dataSource, organization);

      await service.deleteCustomer(
        organization.organizationId,
        customer.customerId,
      );

      const stored = await dataSource
        .getRepository(Customer)
        .findOneByOrFail({ customerId: customer.customerId });
      expect(stored.status).toBe(statusEnum.INACTIVE);
    });

    it('removes the customer’s coupon-code links', async () => {
      const customer = await createCustomer(dataSource, organization);
      const coupon = await createCoupon(dataSource, organization);
      const campaign = await createCampaign(dataSource, organization, coupon);
      const couponCode = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );
      await createCustomerCouponCode(dataSource, customer, couponCode);

      await service.deleteCustomer(
        organization.organizationId,
        customer.customerId,
      );

      expect(
        await dataSource
          .getRepository(CustomerCouponCode)
          .countBy({ customerId: customer.customerId }),
      ).toBe(0);
    });

    it("leaves another customer's coupon-code links intact", async () => {
      const target = await createCustomer(dataSource, organization);
      const bystander = await createCustomer(dataSource, organization);
      const coupon = await createCoupon(dataSource, organization);
      const campaign = await createCampaign(dataSource, organization, coupon);
      const couponCode = await createCouponCode(
        dataSource,
        organization,
        coupon,
        campaign,
      );
      await createCustomerCouponCode(dataSource, target, couponCode);
      await createCustomerCouponCode(dataSource, bystander, couponCode);

      await service.deleteCustomer(
        organization.organizationId,
        target.customerId,
      );

      expect(
        await dataSource
          .getRepository(CustomerCouponCode)
          .countBy({ customerId: bystander.customerId }),
      ).toBe(1);
    });
  });

  describe('upsertCustomer', () => {
    it('keys on the external id rather than the email', async () => {
      await createCustomer(dataSource, organization, {
        name: 'Original',
        externalId: 'ext-1',
      });

      await service.upsertCustomer(
        organization.organizationId,
        createDto({ name: 'Renamed', externalId: 'ext-1' }),
      );

      const rows = await dataSource
        .getRepository(Customer)
        .findBy({ externalId: 'ext-1' });
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Renamed');
    });

    it('inserts when no customer carries that external id', async () => {
      await service.upsertCustomer(
        organization.organizationId,
        createDto({ externalId: 'ext-brand-new' }),
      );

      expect(
        await dataSource
          .getRepository(Customer)
          .countBy({ externalId: 'ext-brand-new' }),
      ).toBe(1);
    });
  });
});
