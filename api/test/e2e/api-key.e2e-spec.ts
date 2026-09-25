import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { apiKeyHeaders, bearer, createUserWithRole } from '../support/auth';
import { createCoupon, createOrganization } from '../support/factories';
import { ApiKey } from '../../src/entities/api-key.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

describe('api keys (e2e)', () => {
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
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const apiKeysUrl = () =>
    `/api/organizations/${organization.organizationId}/api-keys`;

  describe('POST /api-keys', () => {
    it('returns the plaintext secret exactly once, at creation', async () => {
      const response = await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);

      const payload = JSON.stringify(response.body.data);
      expect(payload).toContain('key');

      // The stored secret must be a hash, never the value handed back.
      const stored = await dataSource.getRepository(ApiKey).findOneOrFail({
        where: {
          organization: { organizationId: organization.organizationId },
        },
      });
      expect(stored.secret.startsWith('$2')).toBe(true);
    });

    it('replaces the previous key rather than accumulating keys', async () => {
      await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);

      await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);

      const count = await dataSource
        .getRepository(ApiKey)
        .countBy({
          organization: { organizationId: organization.organizationId },
        });
      expect(count).toBe(1);
    });

    it('issues credentials that then authenticate a request', async () => {
      const response = await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);

      const { key, secret } = response.body.data as {
        key: string;
        secret: string;
      };

      await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}/coupons`)
        .set(apiKeyHeaders({ key, secret }))
        .expect(200);
    });

    it('401s without credentials', async () => {
      await request(app.getHttpServer())
        .post(apiKeysUrl())
        .send({})
        .expect(401);
    });
  });

  describe('GET /api-keys', () => {
    it('returns the key without exposing the secret in the clear', async () => {
      const created = await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);

      const plaintextSecret = (created.body.data as { secret: string }).secret;

      const fetched = await request(app.getHttpServer())
        .get(apiKeysUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(fetched.body)).not.toContain(plaintextSecret);
    });
  });

  describe('api key authorization', () => {
    it('grants write access within its own organization', async () => {
      const created = await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);
      const { key, secret } = created.body.data as {
        key: string;
        secret: string;
      };

      const coupon = await createCoupon(dataSource, organization);

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${organization.organizationId}/coupons/${coupon.couponId}`,
        )
        .set(apiKeyHeaders({ key, secret }))
        .expect(200);
    });

    it('is refused write access to another organization', async () => {
      const created = await request(app.getHttpServer())
        .post(apiKeysUrl())
        .set(...auth)
        .send({})
        .expect(201);
      const { key, secret } = created.body.data as {
        key: string;
        secret: string;
      };

      const foreignOrg = await createOrganization(dataSource);
      const foreignCoupon = await createCoupon(dataSource, foreignOrg);

      await request(app.getHttpServer())
        .delete(
          `/api/organizations/${foreignOrg.organizationId}/coupons/${foreignCoupon.couponId}`,
        )
        .set(apiKeyHeaders({ key, secret }))
        .expect(403);
    });
  });
});
