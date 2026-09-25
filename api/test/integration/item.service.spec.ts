import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import {
  createCoupon,
  createCouponItem,
  createItem,
  createOrganization,
} from '../support/factories';
import { ItemsService } from '../../src/services/item.service';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { Item } from '../../src/entities/item.entity';
import { Organization } from '../../src/entities/organization.entity';
import { statusEnum } from '../../src/enums';

const createDto = (overrides: Record<string, unknown> = {}) =>
  ({
    entity: 'org.quicko.qpon.item',
    name: 'Item under test',
    externalId: 'sku-under-test',
    ...overrides,
  }) as never;

describe('ItemsService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: ItemsService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(ItemsService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
  });

  describe('name uniqueness on create', () => {
    it('matches case-insensitively via ILike', async () => {
      await createItem(dataSource, organization, { name: 'Gaming Laptop' });

      await expect(
        service.createItem(
          organization.organizationId,
          createDto({ name: 'gaming laptop' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('ignores inactive items, so a deleted name can be reused', async () => {
      await createItem(dataSource, organization, {
        name: 'Recycled',
        status: statusEnum.INACTIVE,
      });

      await expect(
        service.createItem(
          organization.organizationId,
          createDto({ name: 'Recycled' }),
        ),
      ).resolves.toBeDefined();
    });

    // Regression guard: the duplicate check used to be
    //   where: { name: ILike(body.name), status: ACTIVE }
    // with no organization predicate, making item names unique across the
    // entire deployment — one tenant's "Laptop" blocked every other tenant,
    // and the 409 disclosed that the name was taken.
    it('allows a name held by a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, otherOrg, { name: 'Shared Name' });

      await expect(
        service.createItem(
          organization.organizationId,
          createDto({ name: 'Shared Name' }),
        ),
      ).resolves.toBeDefined();
    });

    it('keeps both organizations’ items after the shared name is used', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, otherOrg, { name: 'Shared Name' });

      await service.createItem(
        organization.organizationId,
        createDto({ name: 'Shared Name' }),
      );

      expect(
        await dataSource.getRepository(Item).countBy({ name: 'Shared Name' }),
      ).toBe(2);
    });
  });

  describe('name uniqueness on update', () => {
    it('rejects a rename onto a sibling item in the same organization', async () => {
      await createItem(dataSource, organization, { name: 'Taken' });
      const target = await createItem(dataSource, organization, {
        name: 'Mine',
      });

      await expect(
        service.updateItem(target.itemId, createDto({ name: 'Taken' })),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('matches the sibling name case-insensitively', async () => {
      await createItem(dataSource, organization, { name: 'Taken' });
      const target = await createItem(dataSource, organization, {
        name: 'Mine',
      });

      await expect(
        service.updateItem(target.itemId, createDto({ name: 'tAkEn' })),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows renaming an item to the name it already holds', async () => {
      const target = await createItem(dataSource, organization, {
        name: 'Unchanged',
      });

      await expect(
        service.updateItem(target.itemId, createDto({ name: 'Unchanged' })),
      ).resolves.toBeDefined();
    });

    // The same unscoped-lookup bug existed on this path, in a raw query
    // builder: LOWER(item.name) = LOWER(:name) AND status = 'active' AND
    // item_id != :itemId, with no organization predicate.
    it('allows a rename onto a name used by a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, otherOrg, { name: 'Foreign Name' });
      const target = await createItem(dataSource, organization, {
        name: 'Local Name',
      });

      await expect(
        service.updateItem(target.itemId, createDto({ name: 'Foreign Name' })),
      ).resolves.toBeDefined();
    });

    it('ignores inactive items when checking the new name', async () => {
      await createItem(dataSource, organization, {
        name: 'Retired',
        status: statusEnum.INACTIVE,
      });
      const target = await createItem(dataSource, organization, {
        name: 'Active one',
      });

      await expect(
        service.updateItem(target.itemId, createDto({ name: 'Retired' })),
      ).resolves.toBeDefined();
    });
  });

  describe('fetchItems filtering', () => {
    it('scopes results to the organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createItem(dataSource, organization, { name: 'Kept' });
      await createItem(dataSource, otherOrg, { name: 'Excluded' });

      const result = await service.fetchItems(organization.organizationId);

      const body = JSON.stringify(result);
      expect(body).toContain('Kept');
      expect(body).not.toContain('Excluded');
    });

    it('returns only active items', async () => {
      await createItem(dataSource, organization, { name: 'Live' });
      await createItem(dataSource, organization, {
        name: 'Deleted',
        status: statusEnum.INACTIVE,
      });

      const result = await service.fetchItems(organization.organizationId);

      const body = JSON.stringify(result);
      expect(body).toContain('Live');
      expect(body).not.toContain('Deleted');
    });

    it('matches a name substring case-insensitively', async () => {
      await createItem(dataSource, organization, { name: 'Mechanical Keyboard' });
      await createItem(dataSource, organization, { name: 'Mouse' });

      const result = await service.fetchItems(
        organization.organizationId,
        0,
        10,
        { name: 'keyboard' },
      );

      const body = JSON.stringify(result);
      expect(body).toContain('Mechanical Keyboard');
      expect(body).not.toContain('Mouse');
    });
  });

  describe('upsertItem', () => {
    it('keys on the external id rather than the name', async () => {
      await createItem(dataSource, organization, {
        name: 'Original',
        externalId: 'sku-1',
      });

      await service.upsertItem(
        organization.organizationId,
        createDto({ name: 'Renamed', externalId: 'sku-1' }),
      );

      const rows = await dataSource
        .getRepository(Item)
        .findBy({ externalId: 'sku-1' });
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Renamed');
    });

    it('inserts when no item carries that external id', async () => {
      await service.upsertItem(
        organization.organizationId,
        createDto({ externalId: 'sku-brand-new' }),
      );

      expect(
        await dataSource
          .getRepository(Item)
          .countBy({ externalId: 'sku-brand-new' }),
      ).toBe(1);
    });
  });

  describe('deleteItem', () => {
    it('deactivates the item and removes every coupon link', async () => {
      const item = await createItem(dataSource, organization);
      const couponA = await createCoupon(dataSource, organization);
      const couponB = await createCoupon(dataSource, organization);
      await createCouponItem(dataSource, couponA, item);
      await createCouponItem(dataSource, couponB, item);

      await service.deleteItem(item.itemId);

      expect(
        (
          await dataSource
            .getRepository(Item)
            .findOneByOrFail({ itemId: item.itemId })
        ).status,
      ).toBe(statusEnum.INACTIVE);

      expect(
        await dataSource
          .getRepository(CouponItem)
          .countBy({ item: { itemId: item.itemId } }),
      ).toBe(0);
    });

    it('leaves another item’s coupon links intact', async () => {
      const target = await createItem(dataSource, organization);
      const bystander = await createItem(dataSource, organization);
      const coupon = await createCoupon(dataSource, organization);
      await createCouponItem(dataSource, coupon, target);
      await createCouponItem(dataSource, coupon, bystander);

      await service.deleteItem(target.itemId);

      expect(
        await dataSource
          .getRepository(CouponItem)
          .countBy({ item: { itemId: bystander.itemId } }),
      ).toBe(1);
    });
  });
});
