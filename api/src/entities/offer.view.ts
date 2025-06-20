import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  discountTypeEnum,
  itemConstraintEnum,
  visibilityEnum,
} from 'src/enums';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'offer',
  expression: `
      SELECT DISTINCT ON (cc.coupon_code_id)
          c.organization_id,
          c.coupon_id,
          camp.campaign_id,
          cc.coupon_code_id,
          cc.code,
          c.discount_type,
          c.discount_value,
          c.discount_upto,
          c.item_constraint,
          cc.customer_constraint,
          cc.minimum_amount,
          cc.max_redemption_per_customer,
          cc.visibility,
          cc.expires_at,
          ct.item_id,
          t.external_id AS external_item_id,
          cust.external_id AS external_customer_id,
          ccc.customer_id,
          camp.external_id AS external_campaign_id,
          cc.status AS coupon_code_status,
          now() as created_at,
          clock_timestamp() as updated_at
      FROM coupon c
      LEFT JOIN campaign camp ON camp.coupon_id = c.coupon_id
      LEFT JOIN coupon_code cc ON c.coupon_id = cc.coupon_id
      LEFT JOIN coupon_item ct ON c.coupon_id = ct.coupon_id
      LEFT JOIN item t ON ct.item_id = t.item_id
      LEFT JOIN customer_coupon_code ccc ON ccc.coupon_code_id = cc.coupon_code_id
      LEFT JOIN customer cust ON cust.customer_id = ccc.customer_id
      WHERE cc.status = 'active' AND  (cc.expires_at > now() OR cc.expires_at IS NULL);
    `,
})
export class Offer {
  @ViewColumn({ name: 'coupon_id' })
  couponId: string;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @ViewColumn({ name: 'campaign_id' })
  campaignId: string;

  @ViewColumn({ name: 'coupon_code_id' })
  couponCodeId: string;

  @ViewColumn()
  code: string;

  @ViewColumn({ name: 'discount_type' })
  discountType: discountTypeEnum;

  @ViewColumn({
    name: 'discount_value',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  discountValue: number;

  @ViewColumn({
    name: 'discount_upto',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  discountUpto: number;

  @ViewColumn({ name: 'item_constraint' })
  itemConstraint: itemConstraintEnum;

  @ViewColumn({ name: 'customer_constraint' })
  customerConstraint: customerConstraintEnum;

  @ViewColumn({
    name: 'minimum_amount',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  minimumAmount: number;
  
  @ViewColumn({
    name: 'max_redemption_per_customer',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  maxRedemptionPerCustomer: number;

  @ViewColumn()
  visibility: visibilityEnum;

  @ViewColumn({ name: 'item_id' })
  itemId: string;

  @ViewColumn({ name: 'customer_id' })
  customerId: string;

  @ViewColumn({ name: 'external_item_id' })
  externalItemId: string;

  @ViewColumn({ name: 'external_customer_id' })
  externalCustomerId: string;

  @ViewColumn({ name: 'external_campaign_id' })
  externalCampaignId: string;

  @ViewColumn({ name: 'coupon_code_status' })
  couponCodeStatus: couponCodeStatusEnum;

  @ViewColumn({ name: 'expires_at' })
  expiresAt: Date;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
