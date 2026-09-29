import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env, type Credentials, type MemberRole } from '../env';

export interface Organization {
  organizationId: string;
  name: string;
}

export interface Item {
  itemId: string;
  name: string;
  description?: string;
  externalId: string;
  customFields?: Record<string, string>;
}

export type NewItem = Omit<Item, 'itemId'>;

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  externalId: string;
  isdCode?: string;
  phone?: string;
}

export type NewCustomer = Omit<Customer, 'customerId'>;

export interface Coupon {
  couponId: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  /** The cap on a percentage discount. Not allowed on a fixed one. */
  discountUpto?: number;
  itemConstraint: 'all' | 'specific';
}

export type NewCoupon = Omit<Coupon, 'couponId'>;

export interface Campaign {
  campaignId: string;
  name: string;
  /** Omitted for an unlimited budget. */
  budget?: number;
}

export type NewCampaign = Omit<Campaign, 'campaignId'>;

export interface CouponCode {
  couponCodeId: string;
  code: string;
  description?: string;
  customerConstraint: 'all' | 'specific';
  visibility: 'public' | 'private';
  durationType: 'forever' | 'limited';
  /** ISO timestamp; only meaningful when `durationType` is `limited`. */
  expiresAt?: string;
  maxRedemptions?: number;
  minimumAmount?: number;
  maxRedemptionPerCustomer?: number;
}

export type NewCouponCode = Omit<CouponCode, 'couponCodeId'>;

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
}

export type NewMember = Omit<Member, 'userId'> & { password: string };

export interface ApiKey {
  key: string;
  /** Only ever returned by the call that created the key. */
  secret: string;
}

export interface Redemption {
  /** The coupon code being redeemed. */
  code: string;
  baseOrderValue: number;
  discount: number;
  /** The customer's and item's `externalId`, not their UUIDs. */
  externalCustomerId: string;
  externalItemId: string;
}

/**
 * Minimal client for arranging test data. It talks to the same endpoints the
 * app does, so fixtures build state the way a user (or integration) would —
 * never by writing to the database directly, which keeps the suite runnable
 * against any deployed environment.
 */
export class QponApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  /** Returns a client authenticated as `user`. */
  static async signIn(request: APIRequestContext, user: Credentials): Promise<QponApi> {
    return new QponApi(request, await QponApi.accessToken(request, user));
  }

  static async accessToken(request: APIRequestContext, user: Credentials): Promise<string> {
    const data = await unwrap<{ access_token: string }>(
      `sign in as ${user.email}`,
      request.post(`${env.apiURL}/users/login`, {
        data: { email: user.email, password: user.password },
      }),
    );
    return data.access_token;
  }

  async superAdminExists(): Promise<boolean> {
    const data = await unwrap<{ exists: boolean }>(
      'check for a super admin',
      this.request.get(`${env.apiURL}/super-admin/exists`, IDEMPOTENT),
    );
    return data.exists;
  }

  async createSuperAdmin(user: Credentials): Promise<void> {
    await unwrap('create the super admin', this.request.post(`${env.apiURL}/users`, {
      data: {
        '@entity': 'org.quicko.qpon.user',
        name: user.name,
        email: user.email,
        password: user.password,
        role: 'super_admin',
      },
    }));
  }

  async createOrganization(name: string): Promise<Organization> {
    const data = await unwrap<{ organization_id: string; name: string }>(
      `create organization "${name}"`,
      this.request.post(`${env.apiURL}/organizations`, {
        headers: this.auth(),
        data: { '@entity': 'org.quicko.qpon.organization', name, currency: 'INR' },
      }),
    );
    return { organizationId: data.organization_id, name: data.name };
  }

  /**
   * Deletes the organization and — via FK cascades — everything in it.
   *
   * The API refuses while any coupon is still active, so clear those first:
   * deactivating a coupon deactivates its campaigns and codes too.
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    for (const coupon of await this.fetchCoupons(organizationId, 'active')) {
      await this.deactivateCoupon(organizationId, coupon.couponId);
    }

    await unwrap(`delete organization ${organizationId}`, this.request.delete(
      `${env.apiURL}/organizations/${organizationId}`,
      { ...IDEMPOTENT, headers: this.auth() },
    ));
  }

  /** Invites `user`; if they already exist, this just adds the membership. */
  async addMember(organizationId: string, user: Credentials, role: MemberRole): Promise<void> {
    await this.inviteUser(organizationId, { ...user, role });
  }

  /** Same invite the team page performs, for a user the test made up. */
  async inviteUser(organizationId: string, member: NewMember): Promise<Member> {
    const data = await unwrap<{ user_id: string }>(
      `invite ${member.email} as ${member.role}`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/users`, {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.user',
          name: member.name,
          email: member.email,
          password: member.password,
          role: member.role,
        },
      }),
    );
    const { password, ...saved } = member;
    return { ...saved, userId: data.user_id };
  }

  async createItem(organizationId: string, item: NewItem): Promise<Item> {
    const data = await unwrap<{ item_id: string }>(
      `create item "${item.name}"`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/items`, {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.item',
          name: item.name,
          description: item.description,
          external_id: item.externalId,
          custom_fields: item.customFields,
        },
      }),
    );
    return { ...item, itemId: data.item_id };
  }

  async createCustomer(organizationId: string, customer: NewCustomer): Promise<Customer> {
    const data = await unwrap<{ customer_id: string }>(
      `create customer "${customer.name}"`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/customers`, {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.customer',
          name: customer.name,
          email: customer.email,
          external_id: customer.externalId,
          isd_code: customer.isdCode,
          phone: customer.phone,
        },
      }),
    );
    return { ...customer, customerId: data.customer_id };
  }

  async createCoupon(organizationId: string, coupon: NewCoupon): Promise<Coupon> {
    const data = await unwrap<{ coupon_id: string }>(
      `create coupon "${coupon.name}"`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/coupons`, {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.coupon',
          name: coupon.name,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          discount_upto: coupon.discountUpto,
          item_constraint: coupon.itemConstraint,
        },
      }),
    );
    return { ...coupon, couponId: data.coupon_id };
  }

  /** Switches a coupon off, taking its campaigns and codes with it. */
  async deactivateCoupon(organizationId: string, couponId: string): Promise<void> {
    await unwrap(`deactivate coupon ${couponId}`, this.request.post(
      `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}/deactivate`,
      { headers: this.auth() },
    ));
  }

  /** Coupons the organization still has switched on, newest first. */
  async fetchCoupons(organizationId: string, status?: 'active' | 'inactive'): Promise<Coupon[]> {
    const coupons: Coupon[] = [];
    for (let skip = 0; ; skip += PAGE_SIZE) {
      const page = await unwrap<Page<CouponPayload>>(
        `fetch coupons of organization ${organizationId}`,
        this.request.get(`${env.apiURL}/organizations/${organizationId}/coupons`, {
          ...IDEMPOTENT,
          headers: this.auth(),
          params: { skip, take: PAGE_SIZE, ...(status ? { status } : {}) },
        }),
      );
      coupons.push(
        ...page.items.map((item) => ({
          couponId: item.coupon_id,
          name: item.name,
          discountType: item.discount_type,
          // Numeric columns come back as strings.
          discountValue: Number(item.discount_value),
          discountUpto: item.discount_upto == null ? undefined : Number(item.discount_upto),
          itemConstraint: item.item_constraint,
        })),
      );
      if (coupons.length >= page.count || page.items.length === 0) return coupons;
    }
  }

  async createCampaign(
    organizationId: string,
    couponId: string,
    campaign: NewCampaign,
  ): Promise<Campaign> {
    const data = await unwrap<{ campaign_id: string }>(
      `create campaign "${campaign.name}"`,
      this.request.post(
        `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}/campaigns`,
        {
          headers: this.auth(),
          data: {
            '@entity': 'org.quicko.qpon.campaign',
            name: campaign.name,
            budget: campaign.budget,
          },
        },
      ),
    );
    return { ...campaign, campaignId: data.campaign_id };
  }

  /**
   * Narrows a coupon to specific items. Two calls, the way the app does it:
   * the constraint lives on the coupon, the items hang off it.
   */
  async restrictCouponToItems(
    organizationId: string,
    couponId: string,
    itemIds: string[],
  ): Promise<void> {
    await unwrap(`narrow coupon ${couponId} to specific items`, this.request.patch(
      `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}`,
      {
        headers: this.auth(),
        data: { '@entity': 'org.quicko.qpon.coupon', item_constraint: 'specific' },
      },
    ));

    await unwrap(`add ${itemIds.length} item(s) to coupon ${couponId}`, this.request.post(
      `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}/items`,
      {
        headers: this.auth(),
        data: { '@entity': 'org.quicko.qpon.coupon_item', items: itemIds },
      },
    ));
  }

  /** Generates the organization's API key, replacing any it already had. */
  async createApiKey(organizationId: string): Promise<ApiKey> {
    const data = await unwrap<{ key: string; secret: string }>(
      `generate an API key for organization ${organizationId}`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/api-keys`, {
        headers: this.auth(),
        data: {},
      }),
    );
    return { key: data.key, secret: data.secret };
  }

  /**
   * Redeems a coupon code, which is what an integration does at checkout —
   * the app itself only ever reads redemptions back.
   */
  async redeem(organizationId: string, redemption: Redemption): Promise<void> {
    await unwrap(`redeem "${redemption.code}"`, this.request.post(
      `${env.apiURL}/organizations/${organizationId}/coupon-codes/redeem`,
      {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.redemption',
          code: redemption.code,
          base_order_value: redemption.baseOrderValue,
          discount: redemption.discount,
          external_customer_id: redemption.externalCustomerId,
          external_item_id: redemption.externalItemId,
        },
      },
    ));
  }

  /** Switches a campaign off, taking its coupon codes with it. */
  async deactivateCampaign(
    organizationId: string,
    couponId: string,
    campaignId: string,
  ): Promise<void> {
    await unwrap(`deactivate campaign ${campaignId}`, this.request.post(
      `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}` +
        `/campaigns/${campaignId}/deactivate`,
      { headers: this.auth() },
    ));
  }

  async createCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCode: NewCouponCode,
  ): Promise<CouponCode> {
    const data = await unwrap<{ coupon_code_id: string }>(
      `create coupon code "${couponCode.code}"`,
      this.request.post(
        `${env.apiURL}/organizations/${organizationId}/coupons/${couponId}` +
          `/campaigns/${campaignId}/coupon-codes`,
        {
          headers: this.auth(),
          data: {
            '@entity': 'org.quicko.qpon.coupon_code',
            code: couponCode.code,
            description: couponCode.description,
            customer_constraint: couponCode.customerConstraint,
            visibility: couponCode.visibility,
            duration_type: couponCode.durationType,
            expires_at: couponCode.expiresAt,
            max_redemptions: couponCode.maxRedemptions,
            minimum_amount: couponCode.minimumAmount,
            max_redemption_per_customer: couponCode.maxRedemptionPerCustomer,
          },
        },
      ),
    );
    return { ...couponCode, couponCodeId: data.coupon_code_id };
  }

  /** Restricts a `specific` coupon code to the given customers. */
  async addCouponCodeCustomers(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    customerIds: string[],
  ): Promise<void> {
    await unwrap(`restrict coupon code ${couponCodeId} to ${customerIds.length} customer(s)`,
      this.request.post(
        `${env.apiURL}/coupons/${couponId}/campaigns/${campaignId}` +
          `/coupon-codes/${couponCodeId}/customers`,
        {
          headers: this.auth(),
          data: { '@entity': 'org.quicko.qpon.customer_coupon_code', customers: customerIds },
        },
      ));
  }

  private auth(): Record<string, string> {
    if (!this.token) throw new Error('This QponApi client is not signed in.');
    return { Authorization: `Bearer ${this.token}` };
  }
}

/**
 * A busy run can have the app drop a connection mid-request. Retrying is only
 * safe where sending twice is the same as sending once, so this is spread into
 * reads and deletes and never into a create.
 */
const IDEMPOTENT = { maxRetries: 3 };

/** Plenty for a single test's data, and few enough round trips to page through. */
const PAGE_SIZE = 100;

interface Page<T> {
  items: T[];
  count: number;
}

interface CouponPayload {
  coupon_id: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  discount_upto: string | null;
  item_constraint: 'all' | 'specific';
}

/** Unwraps the API's `{ code, message, data }` envelope, failing loudly with the response body. */
async function unwrap<T = unknown>(action: string, pending: Promise<APIResponse>): Promise<T> {
  const response = await pending;
  if (!response.ok()) {
    throw new Error(`Could not ${action}: ${response.status()} ${await response.text()}`);
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}
