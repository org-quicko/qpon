import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin, truncateAll } from '../support/test-app';
import { beginIsolatedTransaction } from '../support/transaction';
import { createCoupon, createOrganization } from '../support/factories';
import { CouponService } from '../../src/services/coupon.service';
import { Coupon } from '../../src/entities/coupon.entity';

/**
 * A self-test for the isolation harness. Every other spec trusts
 * `useIsolatedTransaction` to undo its writes; if that silently stopped
 * working, those specs would start leaking into each other and fail in ways
 * that point anywhere but here.
 */
describe('transactional test isolation', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    await truncateAll(dataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('discards rows written inside the transaction', async () => {
    const tx = await beginIsolatedTransaction(dataSource);

    await seedSuperAdmin(dataSource);
    const organization = await createOrganization(dataSource);
    await createCoupon(dataSource, organization, { name: 'Ephemeral' });

    expect(
      await dataSource.getRepository(Coupon).countBy({ name: 'Ephemeral' }),
    ).toBe(1);

    await tx.rollback();

    expect(
      await dataSource.getRepository(Coupon).countBy({ name: 'Ephemeral' }),
    ).toBe(0);
  });

  it('also discards writes made inside a service-level transaction', async () => {
    // CouponService.createCoupon opens its own `dataSource.transaction()`,
    // which nests as a SAVEPOINT on our runner. Its commit must not escape
    // the outer transaction we intend to throw away.
    const tx = await beginIsolatedTransaction(dataSource);

    await seedSuperAdmin(dataSource);
    const organization = await createOrganization(dataSource);

    await app.get(CouponService).createCoupon(organization.organizationId, {
      entity: 'org.quicko.qpon.coupon',
      name: 'Nested write',
      discountType: 'percentage' as never,
      discountValue: 10,
      discountUpto: null as never,
      itemConstraint: 'all' as never,
    });

    expect(
      await dataSource.getRepository(Coupon).countBy({ name: 'Nested write' }),
    ).toBe(1);

    await tx.rollback();

    expect(
      await dataSource.getRepository(Coupon).countBy({ name: 'Nested write' }),
    ).toBe(0);
  });

  // oxlint-disable typescript/unbound-method -- these compare method
  // identity before and after patching; none of them call the method.
  it('restores the DataSource so later specs get real connections', async () => {
    const before = dataSource.createQueryRunner;

    const tx = await beginIsolatedTransaction(dataSource);
    expect(dataSource.createQueryRunner).not.toBe(before);

    await tx.rollback();
    expect(dataSource.createQueryRunner).toBe(before);
  });
  // oxlint-enable typescript/unbound-method
});
