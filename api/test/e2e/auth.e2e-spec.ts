import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import { createOrganization } from '../support/factories';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

/**
 * AuthGuard's own behaviour, independent of any one resource: which
 * credential shapes it accepts, and how it fails.
 */
describe('authentication (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp({ http: true });
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;
  let guardedUrl: string;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    guardedUrl = `/api/organizations/${organization.organizationId}/coupons`;
  });

  it('401s when no credentials are supplied', async () => {
    await request(app.getHttpServer()).get(guardedUrl).expect(401);
  });

  it('401s on a malformed Authorization header', async () => {
    await request(app.getHttpServer())
      .get(guardedUrl)
      .set('Authorization', 'not-a-bearer-token')
      .expect(401);
  });

  it('401s when the scheme is not Bearer', async () => {
    const user = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    const token = app.get(JwtService).sign({ sub: user.userId });

    await request(app.getHttpServer())
      .get(guardedUrl)
      .set('Authorization', `Basic ${token}`)
      .expect(401);
  });

  it('401s on a token signed with a different secret', async () => {
    const user = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    const forged = app
      .get(JwtService)
      .sign({ sub: user.userId }, { secret: 'not-the-real-secret' });

    await request(app.getHttpServer())
      .get(guardedUrl)
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
  });

  it('401s on an expired token', async () => {
    const user = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    const expired = app
      .get(JwtService)
      .sign({ sub: user.userId }, { expiresIn: '-1s' });

    await request(app.getHttpServer())
      .get(guardedUrl)
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });

  it('accepts a valid bearer token', async () => {
    const user = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });

    await request(app.getHttpServer())
      .get(guardedUrl)
      .set(...bearer(app, user))
      .expect(200);
  });

  it('403s, not 401s, for a well-signed token whose user no longer exists', async () => {
    const user = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    const token = app.get(JwtService).sign({ sub: user.userId });

    await dataSource.getRepository('user').delete({ userId: user.userId });

    // AuthGuard only verifies the signature; PermissionGuard is what looks
    // the user up, so a deleted user fails authorization rather than
    // authentication.
    const response = await request(app.getHttpServer())
      .get(guardedUrl)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('falls back to the api-key path only when both key headers are present', async () => {
    // Only one of the two headers — AuthGuard should not route to
    // ApiKeyGuard, and with no bearer token this is an ordinary 401.
    await request(app.getHttpServer())
      .get(guardedUrl)
      .set('x-api-key', 'some-key')
      .expect(401);
  });
});
