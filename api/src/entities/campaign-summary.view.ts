import { campaignStatusEnum } from 'src/enums';
import { Index, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'campaign_summary_mv',
  expression: `
     SELECT
      c.organization_id,
      cp.coupon_id,
      cp.campaign_id,
      cp.name,
      cp.budget,
      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
      cp.status,
      cp.created_at AS created_at,
      clock_timestamp() AS updated_at
    FROM campaign cp
    LEFT JOIN coupon c ON cp.coupon_id = c.coupon_id
    LEFT JOIN (
        -- Aggregate redemption counts per campaign
        SELECT 
            campaign_id,
            COUNT(redemption_id) AS total_redemption_count,
            SUM(discount) AS total_redemption_amount
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
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @ViewColumn({ name: 'coupon_id' })
  couponId: string;

  @Index()
  @ViewColumn({ name: 'campaign_id' })
  campaignId: string;

  @ViewColumn()
  name: string;

  @ViewColumn({
    name: 'budget',
    transformer: {
      from: (value) => value,
      to: (value) => value,
    },
  })
  budget: number | null;

  @ViewColumn({
    name: 'total_redemption_count',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  totalRedemptionCount: number;

  @ViewColumn({
    name: 'total_redemption_amount',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  totalRedemptionAmount: number;

  @ViewColumn({
    name: 'active_coupon_code_count',
    transformer: {
      from: (value) => Number(value),
      to: (value) => value,
    },
  })
  activeCouponCodeCount: number;

  @ViewColumn()
  status: campaignStatusEnum;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
