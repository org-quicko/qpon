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
import { Item } from '../../src/entities/item.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum, statusEnum } from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('items (e2e)', () => {
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

  const itemsUrl = () =>
    `/api/organizations/${organization.organizationId}/items`;

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.item',
    name: 'Laptop',
    external_id: 'sku-laptop',
    ...overrides,
  });

  describe('POST /items', () => {
    it('creates an item against the organization in the path', async () => {
      const response = await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      const stored = await dataSource.getRepository(Item).findOne({
        where: { itemId: response.body.data.item_id },
        relations: { organization: true },
      });
      expect(stored?.organization.organizationId).toBe(
        organization.organizationId,
      );
      expect(stored?.status).toBe(statusEnum.ACTIVE);
    });

    it('409s on a duplicate name within the organization', async () => {
      await createItem(dataSource, organization, { name: 'Laptop' });

      await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(validBody())
        .expect(409);
    });

    it('allows a name already used by a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, otherOrg, { name: 'Laptop' });

      await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('accepts optional custom fields', async () => {
      await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(validBody({ custom_fields: { colour: 'black' } }))
        .expect(201);

      const stored = await dataSource
        .getRepository(Item)
        .findOneByOrFail({ name: 'Laptop' });
      expect(stored.customFields).toEqual({ colour: 'black' });
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(validBody({ bogus: 1 }))
        .expect(400);
    });

    it('rejects a body missing the external id', async () => {
      const payload = validBody();
      delete (payload as Record<string, unknown>).external_id;

      await request(app.getHttpServer())
        .post(itemsUrl())
        .set(...auth)
        .send(payload)
        .expect(400);
    });
  });

  describe('PUT /items/upsert', () => {
    it('creates the item when the external id is new', async () => {
      await request(app.getHttpServer())
        .put(`${itemsUrl()}/upsert`)
        .set(...auth)
        .send(validBody({ external_id: 'sku-new' }))
        .expect(200);

      expect(
        await dataSource
          .getRepository(Item)
          .countBy({ externalId: 'sku-new' }),
      ).toBe(1);
    });

    it('updates in place when the external id already exists', async () => {
      await createItem(dataSource, organization, {
        name: 'Old name',
        externalId: 'sku-existing',
      });

      await request(app.getHttpServer())
        .put(`${itemsUrl()}/upsert`)
        .set(...auth)
        .send(validBody({ name: 'New name', external_id: 'sku-existing' }))
        .expect(200);

      const rows = await dataSource
        .getRepository(Item)
        .findBy({ externalId: 'sku-existing' });
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('New name');
    });
  });

  describe('GET /items', () => {
    it('returns only items of the organization in the path', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, organization, { name: 'Mine' });
      await createItem(dataSource, otherOrg, { name: 'Theirs' });

      const response = await request(app.getHttpServer())
        .get(itemsUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Mine');
      expect(body).not.toContain('Theirs');
    });

    it('filters by name, partially and case-insensitively', async () => {
      await createItem(dataSource, organization, { name: 'Gaming Laptop' });
      await createItem(dataSource, organization, { name: 'Desk Lamp' });

      const response = await request(app.getHttpServer())
        .get(itemsUrl())
        .query({ name: 'laptop' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Gaming Laptop');
      expect(body).not.toContain('Desk Lamp');
    });

    it('filters by external id', async () => {
      await createItem(dataSource, organization, {
        name: 'Findable',
        externalId: 'sku-find',
      });
      await createItem(dataSource, organization, { name: 'Other' });

      const response = await request(app.getHttpServer())
        .get(itemsUrl())
        .query({ external_id: 'sku-find' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Findable');
      expect(body).not.toContain('Other');
    });

    it('excludes deleted (inactive) items', async () => {
      await createItem(dataSource, organization, {
        name: 'Removed',
        status: statusEnum.INACTIVE,
      });

      const response = await request(app.getHttpServer())
        .get(itemsUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('Removed');
    });
  });

  describe('GET /items/:item_id', () => {
    it('returns the item', async () => {
      const item = await createItem(dataSource, organization, {
        name: 'Fetch me',
      });

      const response = await request(app.getHttpServer())
        .get(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .expect(200);

      expect(response.body.data).toMatchObject({ name: 'Fetch me' });
    });

    it('404s for an unknown item', async () => {
      await request(app.getHttpServer())
        .get(`${itemsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /items/:item_id', () => {
    it('updates the name', async () => {
      const item = await createItem(dataSource, organization, {
        name: 'Before',
      });

      await request(app.getHttpServer())
        .patch(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.item', name: 'After' })
        .expect(200);

      const stored = await dataSource
        .getRepository(Item)
        .findOneByOrFail({ itemId: item.itemId });
      expect(stored.name).toBe('After');
    });

    it('409s when renaming onto another active item', async () => {
      await createItem(dataSource, organization, { name: 'Taken' });
      const item = await createItem(dataSource, organization, { name: 'Mine' });

      await request(app.getHttpServer())
        .patch(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.item', name: 'Taken' })
        .expect(409);
    });

    it('allows renaming onto a name used by a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, otherOrg, { name: 'Foreign Name' });
      const item = await createItem(dataSource, organization, {
        name: 'Local Name',
      });

      await request(app.getHttpServer())
        .patch(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.item', name: 'Foreign Name' })
        .expect(200);
    });

    it('404s for an unknown item', async () => {
      await request(app.getHttpServer())
        .patch(`${itemsUrl()}/${MISSING_ID}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.item', name: 'Anything' })
        .expect(404);
    });
  });

  describe('DELETE /items/:item_id', () => {
    it('marks the item inactive and unlinks it from coupons', async () => {
      const item = await createItem(dataSource, organization);
      const coupon = await createCoupon(dataSource, organization);
      await createCouponItem(dataSource, coupon, item);

      await request(app.getHttpServer())
        .delete(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(Item)
        .findOneByOrFail({ itemId: item.itemId });
      expect(stored.status).toBe(statusEnum.INACTIVE);

      expect(
        await dataSource
          .getRepository(CouponItem)
          .countBy({ item: { itemId: item.itemId } }),
      ).toBe(0);
    });

    it('404s on a second delete', async () => {
      const item = await createItem(dataSource, organization);

      await request(app.getHttpServer())
        .delete(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`${itemsUrl()}/${item.itemId}`)
        .set(...auth)
        .expect(404);
    });
  });
});
