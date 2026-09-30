import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from '../support/test-app';
import {
  CampaignSummaryMv,
  CouponSummaryMv,
  OrganizationSummaryMv,
  OrganizationsMv,
  CouponCodesWiseDayWiseRedemptionSummaryMv,
  DayWiseRedemptionSummaryMv,
  ItemWiseDayWiseRedemptionSummaryMv,
  CustomerWiseDayWiseRedemptionSummaryMv,
  Offer,
} from '../../src/entities';

/**
 * Sanity check on the biggest unknown from the TypeORM 1.0 upgrade: do the
 * real migrations (run once in globalSetup, against a fresh postgres:18
 * container) actually apply cleanly, and does every view / materialized
 * view entity resolve against the resulting schema?
 */
describe('migrations', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['CampaignSummaryMv', CampaignSummaryMv],
    ['CouponSummaryMv', CouponSummaryMv],
    ['OrganizationSummaryMv', OrganizationSummaryMv],
    ['OrganizationsMv', OrganizationsMv],
    [
      'CouponCodesWiseDayWiseRedemptionSummaryMv',
      CouponCodesWiseDayWiseRedemptionSummaryMv,
    ],
    ['DayWiseRedemptionSummaryMv', DayWiseRedemptionSummaryMv],
    ['ItemWiseDayWiseRedemptionSummaryMv', ItemWiseDayWiseRedemptionSummaryMv],
    [
      'CustomerWiseDayWiseRedemptionSummaryMv',
      CustomerWiseDayWiseRedemptionSummaryMv,
    ],
    ['Offer', Offer],
  ])('%s resolves against the migrated schema', async (_name, entity) => {
    // Other spec files may leave rows behind (Vitest doesn't guarantee file
    // order), so just assert the query against the real schema succeeds —
    // that's the thing this migration actually put at risk.
    await expect(
      dataSource.getRepository(entity).find(),
    ).resolves.toBeInstanceOf(Array);
  });
});
