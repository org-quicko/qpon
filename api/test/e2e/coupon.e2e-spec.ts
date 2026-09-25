import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import { createCoupon, createOrganization } from '../support/factories';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import { User } from '../../src/entities/user.entity';
import {
  discountTypeEnum,
  itemConstraintEnum,
  roleEnum,
  statusEnum,
} from '../../src/enums';

/** An id that is well-formed but guaranteed absent. */
const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

/**
 * Behavioural coverage for the coupon HTTP surface: the happy path of each
 * route, the validation the DTO promises, the not-found/conflict branches the
 * service throws, and the response envelope every client parses.
 *
 * This file is the template the other resources follow.
 */
describe('coupons (e2e)', () => {
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
  let admin: User;
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const couponsUrl = () =>
    `/api/organizations/${organization.organizationId}/coupons`;

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.coupon',
    name: 'Diwali 20',
    discount_type: discountTypeEnum.PERCENTAGE,
    discount_value: 20,
    item_constraint: itemConstraintEnum.ALL,
    ...overrides,
  });

  describe('POST /coupons', () => {
    it('creates a coupon and returns it in the response envelope', async () => {
      const response = await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      expect(response.body).toMatchObject({
        code: 201,
        message: 'Successfully created coupon',
      });
      expect(response.body.data).toMatchObject({
        name: 'Diwali 20',
        discount_type: discountTypeEnum.PERCENTAGE,
      });
    });

    it('persists the coupon against the organization in the path', async () => {
      const response = await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      const stored = await dataSource.getRepository(Coupon).findOne({
        where: { couponId: response.body.data.coupon_id },
        relations: { organization: true },
      });

      expect(stored?.organization.organizationId).toBe(
        organization.organizationId,
      );
      expect(stored?.status).toBe(statusEnum.ACTIVE);
    });

    it('rejects a duplicate name in the same organization, case-insensitively', async () => {
      await createCoupon(dataSource, organization, { name: 'Diwali 20' });

      const response = await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody({ name: 'diwali 20' }))
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('allows the same coupon name in a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCoupon(dataSource, otherOrg, { name: 'Diwali 20' });

      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('rejects a non-positive discount value', async () => {
      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody({ discount_value: 0 }))
        .expect(400);
    });

    it('rejects an unknown discount type', async () => {
      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody({ discount_type: 'buy_one_get_one' }))
        .expect(400);
    });

    it('rejects a body carrying properties the DTO does not declare', async () => {
      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(validBody({ injected_field: 'nope' }))
        .expect(400);
    });

    it('rejects a body missing a required field', async () => {
      const body = validBody();
      delete (body as Record<string, unknown>).name;

      await request(app.getHttpServer())
        .post(couponsUrl())
        .set(...auth)
        .send(body)
        .expect(400);
    });
  });

  describe('GET /coupons', () => {
    it('returns only the coupons of the organization in the path', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCoupon(dataSource, organization, { name: 'Mine' });
      await createCoupon(dataSource, otherOrg, { name: 'Theirs' });

      const response = await request(app.getHttpServer())
        .get(couponsUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Mine');
      expect(body).not.toContain('Theirs');
    });

    it('excludes archived coupons by default', async () => {
      await createCoupon(dataSource, organization, {
        name: 'Archived one',
        status: statusEnum.ARCHIVE,
      });

      const response = await request(app.getHttpServer())
        .get(couponsUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('Archived one');
    });

    it('filters by name with a partial, case-insensitive match', async () => {
      await createCoupon(dataSource, organization, { name: 'Summer Sale' });
      await createCoupon(dataSource, organization, { name: 'Winter Sale' });

      const response = await request(app.getHttpServer())
        .get(couponsUrl())
        .query({ name: 'summer' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Summer Sale');
      expect(body).not.toContain('Winter Sale');
    });

    it('filters by status', async () => {
      await createCoupon(dataSource, organization, {
        name: 'Live one',
        status: statusEnum.ACTIVE,
      });
      await createCoupon(dataSource, organization, {
        name: 'Paused one',
        status: statusEnum.INACTIVE,
      });

      const response = await request(app.getHttpServer())
        .get(couponsUrl())
        .query({ status: statusEnum.INACTIVE })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Paused one');
      expect(body).not.toContain('Live one');
    });

    it('honours take and skip for pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await createCoupon(dataSource, organization, { name: `Coupon ${i}` });
      }

      const firstPage = await request(app.getHttpServer())
        .get(couponsUrl())
        .query({ take: 2, skip: 0 })
        .set(...auth)
        .expect(200);

      const secondPage = await request(app.getHttpServer())
        .get(couponsUrl())
        .query({ take: 2, skip: 2 })
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(firstPage.body)).not.toEqual(
        JSON.stringify(secondPage.body),
      );
    });

    it('returns an empty result rather than an error when nothing matches', async () => {
      const response = await request(app.getHttpServer())
        .get(couponsUrl())
        .query({ name: 'no-such-coupon' })
        .set(...auth)
        .expect(200);

      expect(response.body.code).toBe(200);
    });
  });

  describe('GET /coupons/:coupon_id', () => {
    it('returns the coupon', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        name: 'Fetch me',
      });

      const response = await request(app.getHttpServer())
        .get(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .expect(200);

      expect(response.body.data).toMatchObject({
        coupon_id: coupon.couponId,
        name: 'Fetch me',
      });
    });

    it('404s for an id that does not exist', async () => {
      await request(app.getHttpServer())
        .get(`${couponsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .expect(404);
    });

    it('404s for an archived coupon', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        status: statusEnum.ARCHIVE,
      });

      await request(app.getHttpServer())
        .get(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /coupons/:coupon_id', () => {
    it('updates the name', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        name: 'Old name',
      });

      await request(app.getHttpServer())
        .patch(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'New name' })
        .expect(200);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.name).toBe('New name');
    });

    it('409s when the new name collides with another coupon in the org', async () => {
      await createCoupon(dataSource, organization, { name: 'Taken' });
      const coupon = await createCoupon(dataSource, organization, {
        name: 'Mine',
      });

      await request(app.getHttpServer())
        .patch(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'Taken' })
        .expect(409);
    });

    it('allows renaming a coupon to the name it already has', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        name: 'Same',
      });

      await request(app.getHttpServer())
        .patch(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'Same' })
        .expect(200);
    });

    it('404s for an unknown coupon', async () => {
      await request(app.getHttpServer())
        .patch(`${couponsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon', name: 'Anything' })
        .expect(404);
    });
  });

  describe('DELETE /coupons/:coupon_id', () => {
    it('archives the coupon rather than deleting the row', async () => {
      const coupon = await createCoupon(dataSource, organization);

      await request(app.getHttpServer())
        .delete(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.status).toBe(statusEnum.ARCHIVE);
    });

    it('404s on a second delete of the same coupon', async () => {
      const coupon = await createCoupon(dataSource, organization);

      await request(app.getHttpServer())
        .delete(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`${couponsUrl()}/${coupon.couponId}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('POST /coupons/:coupon_id/deactivate and /reactivate', () => {
    it('deactivate flips the coupon to inactive', async () => {
      const coupon = await createCoupon(dataSource, organization);

      await request(app.getHttpServer())
        .post(`${couponsUrl()}/${coupon.couponId}/deactivate`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.status).toBe(statusEnum.INACTIVE);
    });

    it('reactivate flips it back to active', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        status: statusEnum.INACTIVE,
      });

      await request(app.getHttpServer())
        .post(`${couponsUrl()}/${coupon.couponId}/reactivate`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(Coupon)
        .findOneByOrFail({ couponId: coupon.couponId });
      expect(stored.status).toBe(statusEnum.ACTIVE);
    });

    it('404s when deactivating an archived coupon', async () => {
      const coupon = await createCoupon(dataSource, organization, {
        status: statusEnum.ARCHIVE,
      });

      await request(app.getHttpServer())
        .post(`${couponsUrl()}/${coupon.couponId}/deactivate`)
        .set(...auth)
        .expect(404);
    });
  });
});
