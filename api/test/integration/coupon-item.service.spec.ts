import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCoupon,
  createCouponItem,
  createItem,
  createOrganization,
} from '../support/factories';
import { CouponItemService } from '../../src/services/coupon-item.service';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Organization } from '../../src/entities/organization.entity';
import { statusEnum } from '../../src/enums';

describe('CouponItemService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: CouponItemService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(CouponItemService);
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

  describe('addItems', () => {
    it('throws NotFoundException for an unknown coupon', async () => {
      const item = await createItem(dataSource, organization);

      await expect(
        service.addItems('00000000-0000-0000-0000-000000000000', {
          entity: 'org.quicko.qpon.coupon_item',
          items: [item.itemId],
        } as never),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('rejects an item id that does not exist', async () => {
      await expect(
        service.addItems(coupon.couponId, {
          entity: 'org.quicko.qpon.coupon_item',
          items: ['00000000-0000-0000-0000-000000000000'],
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('ignores an inactive item id, rejecting it as non-existent', async () => {
      const item = await createItem(dataSource, organization, {
        status: statusEnum.INACTIVE,
      });

      await expect(
        service.addItems(coupon.couponId, {
          entity: 'org.quicko.qpon.coupon_item',
          items: [item.itemId],
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('links every valid item to the coupon', async () => {
      const itemA = await createItem(dataSource, organization);
      const itemB = await createItem(dataSource, organization);

      await service.addItems(coupon.couponId, {
        entity: 'org.quicko.qpon.coupon_item',
        items: [itemA.itemId, itemB.itemId],
      } as never);

      expect(
        await dataSource
          .getRepository(CouponItem)
          .countBy({ coupon: { couponId: coupon.couponId } }),
      ).toBe(2);
    });
  });

  describe('fetchItems', () => {
    it('throws NotFoundException for an unknown coupon', async () => {
      await expect(
        service.fetchItems('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('scopes results to the coupon', async () => {
      const otherCoupon = await createCoupon(dataSource, organization);
      const kept = await createItem(dataSource, organization, {
        name: 'Kept',
      });
      const excluded = await createItem(dataSource, organization, {
        name: 'Excluded',
      });
      await createCouponItem(dataSource, coupon, kept);
      await createCouponItem(dataSource, otherCoupon, excluded);

      const result = await service.fetchItems(coupon.couponId);

      const body = JSON.stringify(result);
      expect(body).toContain('Kept');
      expect(body).not.toContain('Excluded');
    });

    it('matches an item name substring case-insensitively', async () => {
      const laptop = await createItem(dataSource, organization, {
        name: 'Gaming Laptop',
      });
      const mouse = await createItem(dataSource, organization, {
        name: 'Wireless Mouse',
      });
      await createCouponItem(dataSource, coupon, laptop);
      await createCouponItem(dataSource, coupon, mouse);

      const result = await service.fetchItems(coupon.couponId, 0, 10, {
        name: 'laptop',
      } as never);

      const body = JSON.stringify(result);
      expect(body).toContain('Gaming Laptop');
      expect(body).not.toContain('Wireless Mouse');
    });
  });

  describe('updateItems', () => {
    it('replaces the full item set rather than appending to it', async () => {
      const original = await createItem(dataSource, organization, {
        name: 'Original',
      });
      const replacement = await createItem(dataSource, organization, {
        name: 'Replacement',
      });
      await createCouponItem(dataSource, coupon, original);

      await service.updateItems(coupon.couponId, {
        entity: 'org.quicko.qpon.coupon_item',
        items: [replacement.itemId],
      } as never);

      const links = await dataSource.getRepository(CouponItem).find({
        relations: { item: true },
        where: { coupon: { couponId: coupon.couponId } },
      });
      expect(links).toHaveLength(1);
      expect(links[0].item.itemId).toBe(replacement.itemId);
    });

    it('rejects the whole update when one item id is invalid, leaving existing links untouched', async () => {
      const original = await createItem(dataSource, organization);
      await createCouponItem(dataSource, coupon, original);

      await expect(
        service.updateItems(coupon.couponId, {
          entity: 'org.quicko.qpon.coupon_item',
          items: ['00000000-0000-0000-0000-000000000000'],
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(
        await dataSource
          .getRepository(CouponItem)
          .countBy({ coupon: { couponId: coupon.couponId } }),
      ).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('throws NotFoundException when the item is not linked to the coupon', async () => {
      const item = await createItem(dataSource, organization);

      await expect(
        service.removeItem(coupon.couponId, item.itemId),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('removes only the targeted link', async () => {
      const target = await createItem(dataSource, organization);
      const bystander = await createItem(dataSource, organization);
      await createCouponItem(dataSource, coupon, target);
      await createCouponItem(dataSource, coupon, bystander);

      await service.removeItem(coupon.couponId, target.itemId);

      const remaining = await dataSource.getRepository(CouponItem).find({
        relations: { item: true },
        where: { coupon: { couponId: coupon.couponId } },
      });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].item.itemId).toBe(bystander.itemId);
    });
  });
});
