import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/entities/user.entity';
import { roleEnum } from '../../../src/enums';

/** Base tables created by the migrations, in no particular order. */
const TABLES = [
  'redemption',
  'customer_coupon_code',
  'coupon_item',
  'coupon_code',
  'campaign',
  'coupon',
  'customer',
  'item',
  'organization_user',
  'api_key',
  'organization',
  'user',
];

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

/** Clears all app data between tests without restarting the container. */
export async function truncateAll(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`,
  );
}

/**
 * OrganizationSubscriber.afterInsert looks up a super-admin User to provision
 * as the new org's OrganizationUser, and crashes (non-null assertion) if none
 * exists — so any test that creates an Organization needs one seeded first.
 */
export async function seedSuperAdmin(dataSource: DataSource): Promise<User> {
  return dataSource.getRepository(User).save(
    dataSource.getRepository(User).create({
      name: 'Super Admin',
      email: `super-admin-${Date.now()}@test.local`,
      password: 'password',
      role: roleEnum.SUPER_ADMIN,
    }),
  );
}
