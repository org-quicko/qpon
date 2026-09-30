import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  createTestApp,
  truncateAll,
  seedSuperAdmin,
} from '../support/test-app';
import { UserService } from '../../src/services/user.service';
import { CampaignService } from '../../src/services/campaign.service';
import { User } from '../../src/entities/user.entity';
import { Organization } from '../../src/entities/organization.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { Campaign } from '../../src/entities/campaign.entity';
import {
  roleEnum,
  discountTypeEnum,
  campaignStatusEnum,
} from '../../src/enums';

/**
 * Direct regression coverage for the TypeORM 1.0 behavior change this whole
 * migration is riskiest on: `where` clauses used to silently drop an
 * `undefined` property (0.3.x); 1.x throws unless
 * `invalidWhereValuesBehavior.undefined` is set to 'ignore' (see
 * src/config/database.config.ts). These prove that flag actually restores
 * "filter omitted -> unfiltered results" / "filter provided -> narrowed
 * results" end to end through real service calls, not just at the config
 * level.
 */
describe('optional where-clause filters', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('UserService.fetchUsers', () => {
    it('omitting the email filter returns the unfiltered set', async () => {
      const userService = app.get(UserService);
      const userRepo = dataSource.getRepository(User);
      await userRepo.save([
        userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
          password: 'x',
          role: roleEnum.REGULAR,
        }),
        userRepo.create({
          name: 'Bob',
          email: 'bob@example.com',
          password: 'x',
          role: roleEnum.REGULAR,
        }),
      ]);

      // Controller passes `{ email }` unconditionally, so an omitted query
      // param arrives here as `email: undefined`, not an absent key.
      const result = await userService.fetchUsers({ email: undefined });

      expect(result.count).toBe(2);
    });

    it('providing the email filter narrows the results', async () => {
      const userService = app.get(UserService);
      const userRepo = dataSource.getRepository(User);
      await userRepo.save([
        userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
          password: 'x',
          role: roleEnum.REGULAR,
        }),
        userRepo.create({
          name: 'Bob',
          email: 'bob@example.com',
          password: 'x',
          role: roleEnum.REGULAR,
        }),
      ]);

      const result = await userService.fetchUsers({ email: 'alice' });

      expect(result.count).toBe(1);
    });
  });

  describe('CampaignService.fetchCampaigns', () => {
    async function seedCampaigns(dataSource: DataSource) {
      await seedSuperAdmin(dataSource);
      const orgRepo = dataSource.getRepository(Organization);
      const organization = await orgRepo.save(
        orgRepo.create({ name: 'Acme', currency: 'USD' }),
      );

      const couponRepo = dataSource.getRepository(Coupon);
      const coupon = await couponRepo.save(
        couponRepo.create({
          name: 'Summer Sale',
          discountType: discountTypeEnum.PERCENTAGE,
          discountValue: 10,
          organization,
        }),
      );

      const campaignRepo = dataSource.getRepository(Campaign);
      await campaignRepo.save([
        campaignRepo.create({
          name: 'Active Campaign',
          status: campaignStatusEnum.ACTIVE,
          coupon,
          organization,
        }),
        campaignRepo.create({
          name: 'Inactive Campaign',
          status: campaignStatusEnum.INACTIVE,
          coupon,
          organization,
        }),
      ]);

      return coupon;
    }

    it('omitting the status filter returns everything except archived', async () => {
      const campaignService = app.get(CampaignService);
      const coupon = await seedCampaigns(dataSource);

      const campaigns = await campaignService.fetchCampaigns(coupon.couponId);

      expect(campaigns).toHaveLength(2);
    });

    it('providing the status filter narrows the results', async () => {
      const campaignService = app.get(CampaignService);
      const coupon = await seedCampaigns(dataSource);

      const campaigns = await campaignService.fetchCampaigns(
        coupon.couponId,
        campaignStatusEnum.ACTIVE,
      );

      expect(campaigns).toHaveLength(1);
    });
  });
});
