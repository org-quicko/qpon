import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  createTestApp,
  truncateAll,
  seedSuperAdmin,
} from '../support/test-app';
import { Organization } from '../../src/entities/organization.entity';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { roleEnum } from '../../src/enums';

/**
 * OrganizationSubscriber can't be meaningfully unit-tested — it needs a real
 * subscriber registered against a real DataSource and a real transaction.
 * Confirms the codemod/upgrade didn't change its `queryRunner`/`manager`
 * usage in a way that breaks under TypeORM 1.x subscriber typings.
 */
describe('OrganizationSubscriber', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('provisions the super-admin as an OrganizationUser on org creation', async () => {
    const superAdmin = await seedSuperAdmin(dataSource);
    const orgRepo = dataSource.getRepository(Organization);

    const organization = await orgRepo.save(
      orgRepo.create({ name: 'Acme', currency: 'USD' }),
    );

    const orgUser = await dataSource.getRepository(OrganizationUser).findOne({
      where: {
        organization: { organizationId: organization.organizationId },
        user: { userId: superAdmin.userId },
      },
    });

    expect(orgUser).not.toBeNull();
    expect(orgUser?.role).toBe(roleEnum.SUPER_ADMIN);
  });

  it('removes the OrganizationUser link on org removal', async () => {
    await seedSuperAdmin(dataSource);
    const orgRepo = dataSource.getRepository(Organization);

    const organization = await orgRepo.save(
      orgRepo.create({ name: 'Acme', currency: 'USD' }),
    );

    await orgRepo.remove(organization);

    const remainingLinks = await dataSource
      .getRepository(OrganizationUser)
      .find({
        where: {
          organization: { organizationId: organization.organizationId },
        },
      });

    expect(remainingLinks).toHaveLength(0);
  });
});
