import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { Campaign } from '../../src/entities/campaign.entity';
import { Coupon } from '../../src/entities/coupon.entity';
import { CouponCode } from '../../src/entities/coupon-code.entity';
import { CouponItem } from '../../src/entities/coupon-item.entity';
import { Customer } from '../../src/entities/customer.entity';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { Item } from '../../src/entities/item.entity';
import { Organization } from '../../src/entities/organization.entity';
import { Redemption } from '../../src/entities/redemption.entity';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  discountTypeEnum,
  durationTypeEnum,
  itemConstraintEnum,
  statusEnum,
  visibilityEnum,
} from '../../src/enums';

/**
 * Minimal valid rows, so a test only spells out the fields its assertion
 * actually depends on. Every factory persists and returns the saved entity.
 */

const unique = () => randomBytes(4).toString('hex');

/**
 * Note: inserting an Organization fires OrganizationSubscriber, which
 * refreshes two materialized views and requires a SUPER_ADMIN user to already
 * exist — call `seedSuperAdmin` first.
 */
export async function createOrganization(
  dataSource: DataSource,
  overrides: Partial<Organization> = {},
): Promise<Organization> {
  const repo = dataSource.getRepository(Organization);
  return repo.save(
    repo.create({
      name: `Org ${unique()}`,
      currency: 'INR',
      ...overrides,
    }),
  );
}

export async function createCoupon(
  dataSource: DataSource,
  organization: Organization,
  overrides: Partial<Coupon> = {},
): Promise<Coupon> {
  const repo = dataSource.getRepository(Coupon);
  return repo.save(
    repo.create({
      name: `Coupon ${unique()}`,
      discountType: discountTypeEnum.PERCENTAGE,
      discountValue: 10,
      itemConstraint: itemConstraintEnum.ALL,
      status: statusEnum.ACTIVE,
      organization: { organizationId: organization.organizationId },
      ...overrides,
    }),
  );
}

export async function createItem(
  dataSource: DataSource,
  organization: Organization,
  overrides: Partial<Item> = {},
): Promise<Item> {
  const repo = dataSource.getRepository(Item);
  return repo.save(
    repo.create({
      name: `Item ${unique()}`,
      externalId: `ext-${unique()}`,
      organization: { organizationId: organization.organizationId },
      ...overrides,
    }),
  );
}

export async function createCouponItem(
  dataSource: DataSource,
  coupon: Coupon,
  item: Item,
): Promise<CouponItem> {
  const repo = dataSource.getRepository(CouponItem);
  return repo.save(
    repo.create({
      coupon: { couponId: coupon.couponId },
      item: { itemId: item.itemId },
    }),
  );
}

export async function createCampaign(
  dataSource: DataSource,
  organization: Organization,
  coupon: Coupon,
  overrides: Partial<Campaign> = {},
): Promise<Campaign> {
  const repo = dataSource.getRepository(Campaign);
  return repo.save(
    repo.create({
      name: `Campaign ${unique()}`,
      organization: { organizationId: organization.organizationId },
      coupon: { couponId: coupon.couponId },
      ...overrides,
    }),
  );
}

export async function createCustomer(
  dataSource: DataSource,
  organization: Organization,
  overrides: Partial<Customer> = {},
): Promise<Customer> {
  const repo = dataSource.getRepository(Customer);
  const suffix = unique();
  return repo.save(
    repo.create({
      name: `Customer ${suffix}`,
      email: `customer-${suffix}@test.local`,
      externalId: `cust-${suffix}`,
      organization: { organizationId: organization.organizationId },
      ...overrides,
    }),
  );
}

/**
 * Defaults to a code with no expiry, no redemption caps and no customer
 * restriction — i.e. one that redeems successfully — so a test only sets the
 * constraint it is actually exercising.
 */
export async function createCouponCode(
  dataSource: DataSource,
  organization: Organization,
  coupon: Coupon,
  campaign: Campaign,
  overrides: Partial<CouponCode> = {},
): Promise<CouponCode> {
  const repo = dataSource.getRepository(CouponCode);
  return repo.save(
    repo.create({
      code: `CODE${unique().toUpperCase()}`,
      customerConstraint: customerConstraintEnum.ALL,
      visibility: visibilityEnum.PUBLIC,
      durationType: durationTypeEnum.FOREVER,
      status: couponCodeStatusEnum.ACTIVE,
      organization: { organizationId: organization.organizationId },
      coupon: { couponId: coupon.couponId },
      campaign: { campaignId: campaign.campaignId },
      ...overrides,
    }),
  );
}

/** Links a customer to a code whose customerConstraint is SPECIFIC. */
export async function createCustomerCouponCode(
  dataSource: DataSource,
  customer: Customer,
  couponCode: CouponCode,
): Promise<CustomerCouponCode> {
  const repo = dataSource.getRepository(CustomerCouponCode);
  return repo.save(
    repo.create({
      customerId: customer.customerId,
      couponCodeId: couponCode.couponCodeId,
    }),
  );
}

export async function createRedemption(
  dataSource: DataSource,
  organization: Organization,
  coupon: Coupon,
  campaign: Campaign,
  couponCode: CouponCode,
  customer: Customer,
  item: Item,
  overrides: Partial<Redemption> = {},
): Promise<Redemption> {
  const repo = dataSource.getRepository(Redemption);
  return repo.save(
    repo.create({
      baseOrderValue: 1000,
      discount: 100,
      organization: { organizationId: organization.organizationId },
      coupon: { couponId: coupon.couponId },
      campaign: { campaignId: campaign.campaignId },
      couponCode: { couponCodeId: couponCode.couponCodeId },
      customer: { customerId: customer.customerId },
      item: { itemId: item.itemId },
      ...overrides,
    }),
  );
}

/**
 * The full graph a redemption needs: organization, coupon, campaign, code,
 * customer and item, all consistently linked. Most redemption and offer tests
 * start from this and then mutate one field.
 */
export async function createRedeemableSetup(
  dataSource: DataSource,
  organization: Organization,
  options: {
    coupon?: Partial<Coupon>;
    campaign?: Partial<Campaign>;
    couponCode?: Partial<CouponCode>;
  } = {},
) {
  const coupon = await createCoupon(dataSource, organization, options.coupon);
  const campaign = await createCampaign(
    dataSource,
    organization,
    coupon,
    options.campaign,
  );
  const couponCode = await createCouponCode(
    dataSource,
    organization,
    coupon,
    campaign,
    options.couponCode,
  );
  const customer = await createCustomer(dataSource, organization);
  const item = await createItem(dataSource, organization);

  return { coupon, campaign, couponCode, customer, item };
}
