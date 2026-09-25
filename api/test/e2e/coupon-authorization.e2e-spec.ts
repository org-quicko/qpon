import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  apiKeyHeaders,
  bearer,
  createApiKeyCredentials,
  createUserWithRole,
} from '../support/auth';
import { createCoupon, createOrganization } from '../support/factories';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import {
  discountTypeEnum,
  itemConstraintEnum,
  roleEnum,
} from '../../src/enums';

/**
 * The permission matrix for the coupon routes.
 *
 * AuthGuard and PermissionGuard are both APP_GUARDs, so authentication and
 * authorization are only ever exercised over HTTP — there is no unit-level
 * seam that proves a VIEWER cannot create a coupon. That makes this the
 * highest-value e2e file in the suite: CASL abilities are built from the
 * caller's per-organization role in AuthorizationService, and a mistake there
 * is invisible until a request is actually refused.
 */
describe('coupon authorization (e2e)', () => {
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
  let coupon: Coupon;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
  });

  const couponsUrl = () =>
    `/api/organizations/${organization.organizationId}/coupons`;

  const createBody = {
    '@entity': 'org.quicko.qpon.coupon',
    name: 'Authorization probe',
    discount_type: discountTypeEnum.PERCENTAGE,
    discount_value: 15,
    item_constraint: itemConstraintEnum.ALL,
  };

  async function authFor(role: roleEnum): Promise<[string, string]> {
    const user = await createUserWithRole(dataSource, { role, organization });
    return bearer(app, user);
  }

  describe('roles that may write', () => {
    it.each([roleEnum.SUPER_ADMIN, roleEnum.ADMIN, roleEnum.EDITOR])(
      '%s can create a coupon',
      async (role) => {
        await request(app.getHttpServer())
          .post(couponsUrl())
          .set(...(await authFor(role)))
          .send({ ...createBody, name: `Probe ${role}` })
          .expect(201);
      },
    );

    it.each([roleEnum.SUPER_ADMIN, roleEnum.ADMIN, roleEnum.EDITOR])(
      '%s can update a coupon',
      async (role) => {
        await request(app.getHttpServer())
          .patch(`${couponsUrl()}/${coupon.couponId}`)
          .set(...(await authFor(role)))
          .send({
            '@entity': 'org.quicko.qpon.coupon',
            name: `Renamed ${role}`,
          })
          .expect(200);
      },
    );

    it.each([roleEnum.SUPER_ADMIN, roleEnum.ADMIN, roleEnum.EDITOR])(
      '%s can delete a coupon',
      async (role) => {
        const target = await createCoupon(dataSource, organization);
        await request(app.getHttpServer())
          .delete(`${couponsUrl()}/${target.couponId}`)
          .set(...(await authFor(role)))
          .expect(200);
      },
    );
  });

  describe('viewer is read-only', () => {
    it('can read a single coupon', async () => {
      await request(app.getHttpServer())
        .get(`${couponsUrl()}/${coupon.couponId}`)
        .set(...(await authFor(roleEnum.VIEWER)))
        .expect(200);
    });

    it('can list coupons', async () => {
      await request(app.getHttpServer())
        .get(couponsUrl())
        .set(...(await authFor(roleEnum.VIEWER)))
        .expect(200);
    });

    it('cannot create a coupon', async () => {
      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...(await authFor(roleEnum.VIEWER)))
        .send(createBody)
        .expect(403);
    });

    it('cannot update a coupon', async () => {
      await request(app.getHttpServer())
        .patch(`${couponsUrl()}/${coupon.couponId}`)
        .set(...(await authFor(roleEnum.VIEWER)))
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'Nope' })
        .expect(403);
    });

    it('cannot delete a coupon', async () => {
      await request(app.getHttpServer())
        .delete(`${couponsUrl()}/${coupon.couponId}`)
        .set(...(await authFor(roleEnum.VIEWER)))
        .expect(403);
    });

    it('cannot deactivate a coupon', async () => {
      await request(app.getHttpServer())
        .post(`${couponsUrl()}/${coupon.couponId}/deactivate`)
        .set(...(await authFor(roleEnum.VIEWER)))
        .expect(403);
    });
  });

  describe('a user with no membership in the organization', () => {
    it('is refused a read', async () => {
      const outsider = await createUserWithRole(dataSource, {
        role: roleEnum.REGULAR,
      });

      await request(app.getHttpServer())
        .get(`${couponsUrl()}/${coupon.couponId}`)
        .set(...bearer(app, outsider))
        .expect(403);
    });

    it('is refused a write', async () => {
      const outsider = await createUserWithRole(dataSource, {
        role: roleEnum.REGULAR,
      });

      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...bearer(app, outsider))
        .send(createBody)
        .expect(403);
    });
  });

  describe('API key credentials', () => {
    it('authenticate and authorize a write for their own organization', async () => {
      const credentials = await createApiKeyCredentials(
        dataSource,
        organization,
      );

      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(apiKeyHeaders(credentials))
        .send(createBody)
        .expect(201);
    });

    it('are rejected when the secret is wrong', async () => {
      const credentials = await createApiKeyCredentials(
        dataSource,
        organization,
      );

      await request(app.getHttpServer())
        .get(couponsUrl())
        .set(apiKeyHeaders({ key: credentials.key, secret: 'wrong-secret' }))
        .expect(401);
    });

    it('are rejected when the key is unknown', async () => {
      await request(app.getHttpServer())
        .get(couponsUrl())
        .set(apiKeyHeaders({ key: 'unknown-key', secret: 'whatever' }))
        .expect(401);
    });
  });

  describe('tenant isolation', () => {
    // Regression guard for a cross-tenant hole: AuthorizationService used to
    // pass the organization scope as CASL's third positional argument in an
    // array — allow('manage', [Coupon, ...], ['organization.organizationId'])
    // — which CASL reads as `fields`, not `conditions`. The rule therefore
    // meant "may manage these subjects in ANY organization". The conditions
    // form is an object: { 'organization.organizationId': organizationId }.
    it('refuses an admin of one organization access to another organization’s coupon', async () => {
      const otherOrg = await createOrganization(dataSource);
      const otherCoupon = await createCoupon(dataSource, otherOrg);

      const adminOfFirstOrg = await createUserWithRole(dataSource, {
        role: roleEnum.ADMIN,
        organization,
      });

      const response = await request(app.getHttpServer())
        .delete(
          `/api/organizations/${otherOrg.organizationId}/coupons/${otherCoupon.couponId}`,
        )
        .set(...bearer(app, adminOfFirstOrg));

      expect(response.status).toBe(403);
    });
  });
});
