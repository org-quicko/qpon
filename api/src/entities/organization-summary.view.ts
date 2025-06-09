import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'organization_summary_mv',
  expression: `
       SELECT 
        o.organization_id,
        COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
        COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
        COALESCE(c.active_coupon_count, 0) AS active_coupon_count,
        COALESCE(c.inactive_coupon_count, 0) AS inactive_coupon_count,
        COALESCE(ca.active_campaign_count, 0) AS active_campaign_count,
        COALESCE(ca.inactive_campaign_count, 0) AS inactive_campaign_count,
        COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
        now() AS created_at,
        clock_timestamp() AS updated_at
    FROM organization o
    -- Aggregate redemption data
    LEFT JOIN (
    SELECT 
        organization_id,
        COUNT(redemption_id) AS total_redemption_count,
        SUM(discount) AS total_redemption_amount
    FROM redemption
    GROUP BY organization_id
    ) r ON o.organization_id = r.organization_id
    -- Aggregate coupon data
    LEFT JOIN (
        SELECT 
            organization_id,
            COUNT(*) FILTER (WHERE status = 'active') AS active_coupon_count,
            COUNT(*) FILTER (WHERE status <> 'active') AS inactive_coupon_count
        FROM coupon
        GROUP BY organization_id
    ) c ON o.organization_id = c.organization_id
    -- Aggregate campaign data
    LEFT JOIN (
        SELECT 
            c.organization_id,
            COUNT(*) FILTER (WHERE ca.status = 'active') AS active_campaign_count,
            COUNT(*) FILTER (WHERE ca.status <> 'active') AS inactive_campaign_count
        FROM campaign ca
        JOIN coupon c ON ca.coupon_id = c.coupon_id
        GROUP BY c.organization_id
    ) ca ON o.organization_id = ca.organization_id
    -- Aggregate coupon code data
    LEFT JOIN (
        SELECT 
            c.organization_id,
            COUNT(*) FILTER (WHERE cc.status = 'active') AS active_coupon_code_count
        FROM coupon_code cc
        JOIN coupon c ON cc.coupon_id = c.coupon_id
        GROUP BY c.organization_id
    ) cc ON o.organization_id = cc.organization_id;
    `,
  materialized: true,
})
export class OrganizationSummaryMv {
  @PrimaryColumn({ name: 'organization_id' })
  organizationId: string;

  @Column('bigint', { name: 'total_redemption_count' })
  totalRedemptionCount: number;

  @Column('numeric', { name: 'total_redemption_amount' })
  totalRedemptionAmount: number;

  @Column('bigint', { name: 'active_coupon_count' })
  activeCouponCount: number;

  @Column('bigint', { name: 'inactive_coupon_count' })
  inactiveCouponCount: number;

  @Column('bigint', { name: 'active_campaign_count' })
  activeCampaignCount: number;

  @Column('bigint', { name: 'inactive_campaign_count' })
  inactiveCampaignCount: number;

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
