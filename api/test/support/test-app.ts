import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app-setup';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

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

export interface CreateTestAppOptions {
  /**
   * Apply the production globals from `configureApp` — validation pipe, error
   * filter, response envelope, `/api` prefix. Required for anything driving
   * the app over HTTP; skip it when calling providers directly, since the
   * globals only affect the request pipeline.
   */
  http?: boolean;
}

/**
 * Boots the real AppModule against the container started in globalSetup.
 *
 * With `{ http: true }` the app is wired exactly like `main.ts`, so supertest
 * requests exercise the same validation, serialization and error handling as
 * production — including the `/api` global prefix.
 */
export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  if (options.http) {
    configureApp(app);
  }

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
export async function seedSuperAdmin(
  dataSource: DataSource,
  overrides: Partial<Pick<User, 'name' | 'email' | 'password'>> = {},
): Promise<User> {
  const repo = dataSource.getRepository(User);
  return repo.save(
    repo.create({
      name: overrides.name ?? 'Super Admin',
      email:
        overrides.email ??
        `super-admin-${Date.now()}-${Math.random().toString(16).slice(2)}@test.local`,
      password: overrides.password ?? 'password',
      role: roleEnum.SUPER_ADMIN,
    }),
  );
}
