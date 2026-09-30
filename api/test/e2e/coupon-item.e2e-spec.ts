import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import {
  createCoupon,
  createCouponItem,
  createItem,
  createOrganization,
} from '../support/factories';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Item } from '../../src/entities/item.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum } from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

/**
 * The join between a coupon and the items it applies to. Only meaningful for
 * a coupon whose itemConstraint is SPECIFIC, though the endpoints do not
 * enforce that themselves.
 */
describe('coupon items (e2e)', () => {
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
  let itemA: Item;
  let itemB: Item;
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    coupon = await createCoupon(dataSource, organization);
    itemA = await createItem(dataSource, organization, { name: 'Item A' });
    itemB = await createItem(dataSource, organization, { name: 'Item B' });
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const couponItemsUrl = (id = coupon.couponId) =>
    `/api/organizations/${organization.organizationId}/coupons/${id}/items`;

  const countLinks = () =>
    dataSource
      .getRepository(CouponItem)
      .countBy({ coupon: { couponId: coupon.couponId } });

  describe('POST /items', () => {
    it('links the given items to the coupon', async () => {
      await request(app.getHttpServer())
        .post(couponItemsUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: [itemA.itemId, itemB.itemId],
        })
        .expect(201);

      expect(await countLinks()).toBe(2);
    });

    it('404s when the coupon does not exist', async () => {
      await request(app.getHttpServer())
        .post(couponItemsUrl(MISSING_ID))
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: [itemA.itemId],
        })
        .expect(404);
    });

    it('rejects an items value that is not an array', async () => {
      await request(app.getHttpServer())
        .post(couponItemsUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: itemA.itemId,
        })
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(couponItemsUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: [itemA.itemId],
          extra: 1,
        })
        .expect(400);
    });
  });

  describe('GET /items', () => {
    it('returns the items linked to the coupon', async () => {
      await createCouponItem(dataSource, coupon, itemA);

      const response = await request(app.getHttpServer())
        .get(couponItemsUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Item A');
      expect(body).not.toContain('Item B');
    });

    it('does not return items linked to a different coupon', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      await createCouponItem(dataSource, otherCoupon, itemB);

      const response = await request(app.getHttpServer())
        .get(couponItemsUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('Item B');
    });

    it('filters by item name', async () => {
      await createCouponItem(dataSource, coupon, itemA);
      await createCouponItem(dataSource, coupon, itemB);

      const response = await request(app.getHttpServer())
        .get(couponItemsUrl())
        .query({ name: 'Item A' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Item A');
      expect(body).not.toContain('Item B');
    });
  });

  describe('PATCH /items', () => {
    it('replaces the whole set rather than appending to it', async () => {
      await createCouponItem(dataSource, coupon, itemA);

      await request(app.getHttpServer())
        .patch(couponItemsUrl())
        .set(...auth)
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: [itemB.itemId],
        })
        .expect(200);

      const links = await dataSource.getRepository(CouponItem).find({
        where: { coupon: { couponId: coupon.couponId } },
        relations: { item: true },
      });
      expect(links).toHaveLength(1);
      expect(links[0].item.itemId).toBe(itemB.itemId);
    });

    it('clears the set when given an empty array', async () => {
      await createCouponItem(dataSource, coupon, itemA);

      await request(app.getHttpServer())
        .patch(couponItemsUrl())
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.coupon_item', items: [] })
        .expect(200);

      expect(await countLinks()).toBe(0);
    });
  });

  describe('DELETE /items/:item_id', () => {
    it('removes just that link', async () => {
      await createCouponItem(dataSource, coupon, itemA);
      await createCouponItem(dataSource, coupon, itemB);

      await request(app.getHttpServer())
        .delete(`${couponItemsUrl()}/${itemA.itemId}`)
        .set(...auth)
        .expect(200);

      const links = await dataSource.getRepository(CouponItem).find({
        where: { coupon: { couponId: coupon.couponId } },
        relations: { item: true },
      });
      expect(links).toHaveLength(1);
      expect(links[0].item.itemId).toBe(itemB.itemId);
    });

    it('leaves the item itself in place', async () => {
      await createCouponItem(dataSource, coupon, itemA);

      await request(app.getHttpServer())
        .delete(`${couponItemsUrl()}/${itemA.itemId}`)
        .set(...auth)
        .expect(200);

      expect(
        await dataSource.getRepository(Item).countBy({ itemId: itemA.itemId }),
      ).toBe(1);
    });

    it('404s when the item is not linked to the coupon', async () => {
      await request(app.getHttpServer())
        .delete(`${couponItemsUrl()}/${itemA.itemId}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('authorization', () => {
    it('refuses a viewer the ability to link items', async () => {
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .post(couponItemsUrl())
        .set(...bearer(app, viewer))
        .send({
          '@entity': 'org.quicko.qpon.coupon_item',
          items: [itemA.itemId],
        })
        .expect(403);
    });
  });
});
