import { Index, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'coupon_summary_mv',
  expression: `
   SELECT
      c.organization_id,
      c.coupon_id,
      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
      COALESCE(cc.redeemed_coupon_code_count, 0) AS redeemed_coupon_code_count,
      COALESCE(camp.active_campaign_count, 0) AS active_campaign_count,
      COALESCE(camp.total_campaign_count, 0) AS total_campaign_count,
      COALESCE(camp.budget, 0) AS budget,
      now() AS created_at,
      clock_timestamp() AS updated_at
    FROM coupon c
    LEFT JOIN (
        SELECT 
            coupon_id,
            COUNT(redemption_id) AS total_redemption_count,
            SUM(discount) AS total_redemption_amount
        FROM redemption
        GROUP BY coupon_id
    ) r ON c.coupon_id = r.coupon_id
    LEFT JOIN (
        SELECT 
            coupon_id,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count,
            SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) AS redeemed_coupon_code_count
        FROM coupon_code
        GROUP BY coupon_id
    ) cc ON c.coupon_id = cc.coupon_id
    LEFT JOIN (
        SELECT 
            coupon_id,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_campaign_count,
            COUNT(campaign_id) AS total_campaign_count,
            SUM(budget) AS budget
        FROM campaign
        GROUP BY coupon_id
    ) camp ON c.coupon_id = camp.coupon_id;
    `,
  materialized: true,
})
export class CouponSummaryMv {
  @Index()
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @ViewColumn({ name: 'coupon_id' })
  couponId: string;

  @ViewColumn({ name: 'total_redemption_count' })
  totalRedemptionCount: number;

  @ViewColumn({ name: 'total_redemption_amount' })
  totalRedemptionAmount: number;

  @ViewColumn({ name: 'active_coupon_code_count' })
  activeCouponCodeCount: number;

  @ViewColumn({ name: 'redeemed_coupon_code_count' })
  redeemedCouponCodeCount: number;

  @ViewColumn({ name: 'active_campaign_count' })
  activeCampaignCount: number;

  @ViewColumn({ name: 'total_campaign_count' })
  totalCampaignCount: number;

  @ViewColumn()
  budget: number;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
