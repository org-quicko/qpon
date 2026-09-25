import { AppDataSource } from './data-source';
import { User } from '../src/entities/user.entity';
import { Organization } from '../src/entities/organization.entity';
import { OrganizationUser } from '../src/entities/organization-user.entity';
import { Item } from '../src/entities/item.entity';
import { Coupon } from '../src/entities/coupon.entity';
import { Campaign } from '../src/entities/campaign.entity';
import { CouponCode } from '../src/entities/coupon-code.entity';
import {
  roleEnum,
  statusEnum,
  discountTypeEnum,
  campaignStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  visibilityEnum,
} from '../src/enums';

const SUPER_ADMIN_EMAIL = 'admin@qpon.local';
const DEMO_ORG_EXTERNAL_ID = 'seed-demo-org';

/** Idempotent: safe to run against an already-seeded database. */
async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const orgRepo = AppDataSource.getRepository(Organization);
  const orgUserRepo = AppDataSource.getRepository(OrganizationUser);
  const itemRepo = AppDataSource.getRepository(Item);
  const couponRepo = AppDataSource.getRepository(Coupon);
  const campaignRepo = AppDataSource.getRepository(Campaign);
  const couponCodeRepo = AppDataSource.getRepository(CouponCode);

  let superAdmin = await userRepo.findOne({
    where: { email: SUPER_ADMIN_EMAIL },
  });
  if (!superAdmin) {
    superAdmin = await userRepo.save(
      userRepo.create({
        name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
        password: 'ChangeMe123!',
        role: roleEnum.SUPER_ADMIN,
      }),
    );
    console.log(`Seeded super-admin user: ${SUPER_ADMIN_EMAIL}`);
  } else {
    console.log(`Super-admin user already exists: ${SUPER_ADMIN_EMAIL}`);
  }

  let organization = await orgRepo.findOne({
    where: { externalId: DEMO_ORG_EXTERNAL_ID },
  });
  if (!organization) {
    organization = await orgRepo.save(
      orgRepo.create({
        name: 'Demo Organization',
        currency: 'USD',
        externalId: DEMO_ORG_EXTERNAL_ID,
      }),
    );
    console.log(`Seeded demo organization: ${organization.organizationId}`);
  } else {
    console.log(`Demo organization already exists: ${organization.organizationId}`);
  }

  const existingOrgUser = await orgUserRepo.findOne({
    where: {
      organizationId: organization.organizationId,
      userId: superAdmin.userId,
    },
  });
  if (!existingOrgUser) {
    await orgUserRepo.save(
      orgUserRepo.create({
        organizationId: organization.organizationId,
        userId: superAdmin.userId,
        role: roleEnum.SUPER_ADMIN,
      }),
    );
    console.log('Linked super-admin to demo organization');
  }

  let item = await itemRepo.findOne({
    where: { externalId: 'seed-item-1', organization: { organizationId: organization.organizationId } },
  });
  if (!item) {
    item = await itemRepo.save(
      itemRepo.create({
        name: 'Demo Item',
        description: 'A sample item seeded for local development',
        externalId: 'seed-item-1',
        status: statusEnum.ACTIVE,
        organization,
      }),
    );
    console.log(`Seeded demo item: ${item.itemId}`);
  }

  let coupon = await couponRepo.findOne({
    where: { name: 'Demo Coupon', organization: { organizationId: organization.organizationId } },
  });
  if (!coupon) {
    coupon = await couponRepo.save(
      couponRepo.create({
        name: 'Demo Coupon',
        discountType: discountTypeEnum.PERCENTAGE,
        discountValue: 10,
        status: statusEnum.ACTIVE,
        organization,
      }),
    );
    console.log(`Seeded demo coupon: ${coupon.couponId}`);
  }

  let campaign = await campaignRepo.findOne({
    where: { name: 'Demo Campaign', organization: { organizationId: organization.organizationId } },
  });
  if (!campaign) {
    campaign = await campaignRepo.save(
      campaignRepo.create({
        name: 'Demo Campaign',
        status: campaignStatusEnum.ACTIVE,
        coupon,
        organization,
      }),
    );
    console.log(`Seeded demo campaign: ${campaign.campaignId}`);
  }

  const existingCouponCode = await couponCodeRepo.findOne({
    where: { code: 'DEMO10', organization: { organizationId: organization.organizationId } },
  });
  if (!existingCouponCode) {
    const couponCode = await couponCodeRepo.save(
      couponCodeRepo.create({
        code: 'DEMO10',
        description: '10% off, seeded for local development',
        customerConstraint: customerConstraintEnum.ALL,
        visibility: visibilityEnum.PUBLIC,
        durationType: durationTypeEnum.FOREVER,
        campaign,
        coupon,
        organization,
      }),
    );
    console.log(`Seeded demo coupon code: ${couponCode.couponCodeId}`);
  }

  await AppDataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
