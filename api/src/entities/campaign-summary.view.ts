import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'campaign_summary_mv',
  expression: `
        SELECT 
            cp.campaign_id,
            COALESCE(count(r.redemption_id), 0::bigint) AS total_redemption_count,
            COALESCE(sum(r.amount), 0::numeric) AS total_redemption_amount,
            COALESCE(sum(
                CASE
                    WHEN cc.status::text = 'active'::text THEN 1
                    ELSE 0
                END), 0::bigint) AS active_coupon_code_count,
            now() AS created_at,
            now() AS updated_at
        FROM campaign cp
        LEFT JOIN redemption r ON cp.campaign_id = r.campaign_id
        LEFT JOIN coupon_code cc ON cp.campaign_id = cc.campaign_id
        GROUP BY cp.campaign_id;
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

  @Column('time with time zone', { name: 'created_at', default: () => `now()` })
  createdAt: Date;

  @Column('time with time zone', { name: 'updated_at', default: () => `now()` })
  updatedAt: Date;
}
