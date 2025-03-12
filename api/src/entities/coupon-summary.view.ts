import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'coupon_summary_mv',
  expression: `
        SELECT 
            c.coupon_id,
            COALESCE(count(r.redemption_id), 0::bigint) AS total_redemption_count,
            COALESCE(sum(r.amount), 0::numeric) AS total_redemption_amount,
            COALESCE(sum(
                CASE
                    WHEN cc.status::text = 'active'::text THEN 1
                    ELSE 0
                END), 0::bigint) AS active_coupon_code_count,
            COALESCE(sum(
                CASE
                    WHEN cc.status::text = 'redeemed'::text THEN 1
                    ELSE 0
                END), 0::bigint) AS redeemed_coupon_code_count,
            COALESCE(sum(
                CASE
                    WHEN camp.status::text = 'active'::text THEN 1
                    ELSE 0
                END), 0::bigint) AS active_campaign_count,
            COALESCE(count(camp.campaign_id), 0::bigint) AS total_campaign_count,
            COALESCE(sum(camp.budget), 0::numeric) AS budget,
            now() AS created_at,
            now() AS updated_at
        FROM coupon c
        LEFT JOIN coupon_code cc ON c.coupon_id = cc.coupon_id
        LEFT JOIN campaign camp ON c.coupon_id = camp.coupon_id
        LEFT JOIN redemption r ON c.coupon_id = r.coupon_id
        GROUP BY c.coupon_id;
    `,
  materialized: true,
})
export class CouponSummaryMv {
  @PrimaryColumn({ name: 'coupon_id' })
  couponId: string;

  @Column('bigint', { name: 'total_redemption_count' })
  totalRedemptionCount: number;

  @Column('numeric', { name: 'total_redemption_amount' })
  totalRedemptionAmount: number;

  @Column('bigint', { name: 'active_coupon_code_count' })
  activeCouponCodeCount: number;

  @Column('bigint', { name: 'redeemed_coupon_code_count' })
  redeemedCouponCodeCount: number;

  @Column('bigint', { name: 'active_campaign_count' })
  activeCampaignCount: number;

  @Column('bigint', { name: 'total_campaign_count' })
  totalCampaignCount: number;

  @Column('numeric')
  budget: number;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => `now()`,
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => `now()`,
  })
  updatedAt: Date;
}
