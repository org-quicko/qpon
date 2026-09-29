import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { createCoupon, createOrganization } from '../support/factories';
import { OrganizationService } from '../../src/services/organization.service';
import { Organization } from '../../src/entities/organization.entity';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { statusEnum } from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.organization',
    name: 'Org under test',
    currency: 'INR',
    ...overrides,
  }) as never;

describe('OrganizationService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: OrganizationService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(OrganizationService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
  });

  describe('createOrganization', () => {
    it('persists the organization and provisions the super-admin', async () => {
      const created = await service.createOrganization(createDto());

      const stored = await dataSource
        .getRepository(Organization)
        .findOneByOrFail({ organizationId: created.organizationId });
      expect(stored.name).toBe('Org under test');

      const orgUser = await dataSource.getRepository(OrganizationUser).findOne({
        where: { organizationId: created.organizationId },
      });
      expect(orgUser).not.toBeNull();
    });
  });

  describe('fetchOrganization', () => {
    it('throws NotFoundException for an unknown id', async () => {
      await expect(
        service.fetchOrganization('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('returns the organization for a known id', async () => {
      const organization = await createOrganization(dataSource);

      const result = await service.fetchOrganization(
        organization.organizationId,
      );

      expect(result.organizationId).toBe(organization.organizationId);
    });
  });

  describe('fetchOrganizations filtering', () => {
    it('matches a name substring case-insensitively', async () => {
      await service.createOrganization(createDto({ name: 'Acme Corp' }));
      await service.createOrganization(createDto({ name: 'Widgets Inc' }));

      const result = await service.fetchOrganizations({
        name: 'acme',
        skip: 0,
        take: 10,
      } as never);

      const body = JSON.stringify(result);
      expect(body).toContain('Acme Corp');
      expect(body).not.toContain('Widgets Inc');
    });

    it('filters by externalId', async () => {
      await service.createOrganization(
        createDto({ name: 'Tagged', externalId: 'ext-1' }),
      );
      await service.createOrganization(
        createDto({ name: 'Untagged', externalId: 'ext-2' }),
      );

      const result = await service.fetchOrganizations({
        externalId: 'ext-1',
        skip: 0,
        take: 10,
      } as never);

      const body = JSON.stringify(result);
      expect(body).toContain('Tagged');
      expect(body).not.toContain('Untagged');
    });
  });

  describe('updateOrganization', () => {
    it('throws NotFoundException for an unknown id', async () => {
      await expect(
        service.updateOrganization('00000000-0000-0000-0000-000000000000', {
          name: 'New name',
        } as never),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('persists the changed fields', async () => {
      const organization = await createOrganization(dataSource);

      const updated = await service.updateOrganization(
        organization.organizationId,
        { name: 'Renamed', entity: 'org.quicko.qpon.organization' } as never,
      );

      expect(updated.name).toBe('Renamed');
      const stored = await dataSource
        .getRepository(Organization)
        .findOneByOrFail({ organizationId: organization.organizationId });
      expect(stored.name).toBe('Renamed');
    });
  });

  describe('deleteOrganization', () => {
    it('throws NotFoundException for an unknown id', async () => {
      await expect(
        service.deleteOrganization('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('refuses with 409 while an active coupon exists', async () => {
      const organization = await createOrganization(dataSource);
      await createCoupon(dataSource, organization, {
        status: statusEnum.ACTIVE,
      });

      await expect(
        service.deleteOrganization(organization.organizationId),
      ).rejects.toBeInstanceOf(ConflictException);

      // Left untouched, since the delete was refused.
      await expect(
        dataSource
          .getRepository(Organization)
          .findOneByOrFail({ organizationId: organization.organizationId }),
      ).resolves.toBeDefined();
    });

    it('ignores archived coupons when checking for active ones', async () => {
      const organization = await createOrganization(dataSource);
      await createCoupon(dataSource, organization, {
        status: statusEnum.ARCHIVE,
      });

      await expect(
        service.deleteOrganization(organization.organizationId),
      ).resolves.toBeDefined();
    });

    it('removes the organization and its OrganizationUser links once coupons are inactive', async () => {
      const organization = await createOrganization(dataSource);
      await createCoupon(dataSource, organization, {
        status: statusEnum.INACTIVE,
      });

      await service.deleteOrganization(organization.organizationId);

      await expect(
        dataSource
          .getRepository(Organization)
          .findOneBy({ organizationId: organization.organizationId }),
      ).resolves.toBeNull();

      expect(
        await dataSource.getRepository(OrganizationUser).countBy({
          organizationId: organization.organizationId,
        }),
      ).toBe(0);
    });
  });
});
