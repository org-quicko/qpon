import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { createOrganization } from '../support/factories';
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/entities/user.entity';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.user',
    name: 'User under test',
    email: 'user@test.local',
    password: 'password123',
    role: roleEnum.EDITOR,
    ...overrides,
  }) as never;

describe('UserService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: UserService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(UserService);
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

  describe('createUser', () => {
    it('creates a new user and links it to the organization', async () => {
      await service.createUser(organization.organizationId, createDto());

      const user = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'user@test.local' });
      expect(user.password).not.toBe('password123');
      await expect(bcrypt.compare('password123', user.password)).resolves.toBe(
        true,
      );

      const orgUser = await dataSource.getRepository(OrganizationUser).findOne({
        where: {
          organizationId: organization.organizationId,
          userId: user.userId,
        },
      });
      expect(orgUser?.role).toBe(roleEnum.EDITOR);
    });

    it('links an existing user to a second organization instead of duplicating it', async () => {
      await service.createUser(organization.organizationId, createDto());
      const otherOrg = await createOrganization(dataSource);

      await service.createUser(
        otherOrg.organizationId,
        createDto({ role: roleEnum.VIEWER }),
      );

      expect(
        await dataSource
          .getRepository(User)
          .countBy({ email: 'user@test.local' }),
      ).toBe(1);

      const user = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'user@test.local' });
      const orgUser = await dataSource.getRepository(OrganizationUser).findOne({
        where: {
          organizationId: otherOrg.organizationId,
          userId: user.userId,
        },
      });
      expect(orgUser?.role).toBe(roleEnum.VIEWER);
    });

    it('rejects adding the same user to an organization twice', async () => {
      await service.createUser(organization.organizationId, createDto());

      await expect(
        service.createUser(organization.organizationId, createDto()),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('fetchUsersOfAnOrganization', () => {
    it('excludes the super-admin organization link', async () => {
      const superAdmin = await dataSource
        .getRepository(User)
        .findOneByOrFail({ role: roleEnum.SUPER_ADMIN });
      await service.createUser(organization.organizationId, createDto());

      const result = await service.fetchUsersOfAnOrganization(
        organization.organizationId,
        { skip: 0, take: 10 } as never,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('user@test.local');
      expect(body).not.toContain(superAdmin.userId);
    });

    it('scopes results to the given organization', async () => {
      await service.createUser(organization.organizationId, createDto());
      const otherOrg = await createOrganization(dataSource);
      await service.createUser(
        otherOrg.organizationId,
        createDto({ email: 'other@test.local' }),
      );

      const result = await service.fetchUsersOfAnOrganization(
        organization.organizationId,
        { skip: 0, take: 10 } as never,
      );

      const body = JSON.stringify(result);
      expect(body).toContain('user@test.local');
      expect(body).not.toContain('other@test.local');
    });
  });

  describe('updateUser password change', () => {
    it('rejects an incorrect current password', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto(),
      );

      await expect(
        service.updateUser(organization.organizationId, created.userId, {
          currentPassword: 'wrong-password',
          newPassword: 'brand-new-password',
        } as never),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('hashes and persists the new password when the current one matches', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto(),
      );

      await service.updateUser(organization.organizationId, created.userId, {
        currentPassword: 'password123',
        newPassword: 'brand-new-password',
      } as never);

      const stored = await dataSource
        .getRepository(User)
        .findOneByOrFail({ userId: created.userId });
      await expect(
        bcrypt.compare('brand-new-password', stored.password),
      ).resolves.toBe(true);
    });

    it('throws NotFoundException when the user is not a member of the organization', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto(),
      );
      const otherOrg = await createOrganization(dataSource);

      await expect(
        service.updateUser(otherOrg.organizationId, created.userId, {
          name: 'New name',
        } as never),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('updateUserRole', () => {
    it('updates the role on the organization link', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto({ role: roleEnum.VIEWER }),
      );

      await service.updateUserRole(
        organization.organizationId,
        created.userId,
        {
          role: roleEnum.ADMIN,
        } as never,
      );

      const orgUser = await dataSource
        .getRepository(OrganizationUser)
        .findOneByOrFail({
          organizationId: organization.organizationId,
          userId: created.userId,
        });
      expect(orgUser.role).toBe(roleEnum.ADMIN);
    });

    it("doesn't touch the role of the user's link in another organization", async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto({ role: roleEnum.VIEWER }),
      );
      const otherOrg = await createOrganization(dataSource);
      await service.createUser(
        otherOrg.organizationId,
        createDto({ role: roleEnum.VIEWER }),
      );

      await service.updateUserRole(
        organization.organizationId,
        created.userId,
        {
          role: roleEnum.ADMIN,
        } as never,
      );

      const otherOrgUser = await dataSource
        .getRepository(OrganizationUser)
        .findOneByOrFail({
          organizationId: otherOrg.organizationId,
          userId: created.userId,
        });
      expect(otherOrgUser.role).toBe(roleEnum.VIEWER);
    });
  });

  describe('deleteUser', () => {
    it('throws NotFoundException when the user is not a member of the organization', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto(),
      );
      const otherOrg = await createOrganization(dataSource);

      await expect(
        service.deleteUser(otherOrg.organizationId, created.userId),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('removes the user row', async () => {
      const created = await service.createUser(
        organization.organizationId,
        createDto(),
      );

      await service.deleteUser(organization.organizationId, created.userId);

      await expect(
        dataSource.getRepository(User).findOneBy({ userId: created.userId }),
      ).resolves.toBeNull();
    });
  });

  describe('fetchUserByEmail', () => {
    it('returns undefined for an unknown email without throwing', async () => {
      await expect(
        service.fetchUserByEmail('nobody@test.local'),
      ).resolves.toBeFalsy();
    });

    it('returns the user for a known email', async () => {
      await service.createUser(organization.organizationId, createDto());

      const found = await service.fetchUserByEmail('user@test.local');

      expect(found?.email).toBe('user@test.local');
    });
  });

  describe('superAdminExists', () => {
    it('reports true once a super-admin has been seeded', async () => {
      await expect(service.superAdminExists()).resolves.toEqual({
        exists: true,
      });
    });
  });
});
