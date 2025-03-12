import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'campaign_summary_mv',
  expression: `
      SELECT 
          cp.campaign_id,
          COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
          COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
          COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
          now() AS created_at,
          now() AS updated_at
      FROM campaign cp
      LEFT JOIN (
          -- Aggregate redemption counts per campaign
          SELECT 
              campaign_id,
              COUNT(redemption_id) AS total_redemption_count,
              SUM(amount) AS total_redemption_amount
          FROM redemption
          GROUP BY campaign_id
      ) r ON cp.campaign_id = r.campaign_id
      LEFT JOIN (
          -- Aggregate coupon code counts per campaign
          SELECT 
              campaign_id,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count
          FROM coupon_code
          GROUP BY campaign_id
      ) cc ON cp.campaign_id = cc.campaign_id;
    `,
  materialized: true,
})
export class CampaignSummaryMv {
  @PrimaryColumn({ name: 'campaign_id' })
  campaignId: string;

  @Column('bigint', { name: 'total_redemption_count' })
  totalRedemptionCount: number;

  @Column('numeric', { name: 'total_redemption_amount' })
  totalRedemptionAmount: number;

  @Column('bigint', { name: 'active_coupon_code_count' })
  activeCouponCodeCount: number;

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
