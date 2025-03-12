import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'organization_summary_mv',
  expression: `
        SELECT 
            o.organization_id,
            COALESCE(count(r.redemption_id), 0::bigint) AS total_redemption_count,
            COALESCE(sum(r.amount), 0::numeric) AS total_redemption_amount,
            COALESCE(count(
                CASE
                    WHEN c.status::text = 'active'::text THEN c.coupon_id
                    ELSE NULL::uuid
                END), 0::bigint) AS active_coupon_count,
            COALESCE(count(
                CASE
                    WHEN c.status::text <> 'active'::text THEN c.coupon_id
                    ELSE NULL::uuid
                END), 0::bigint) AS inactive_coupon_count,
            COALESCE(count(
                CASE
                    WHEN ca.status::text = 'active'::text THEN ca.campaign_id
                    ELSE NULL::uuid
                END), 0::bigint) AS active_campaign_count,
            COALESCE(count(
                CASE
                    WHEN ca.status::text <> 'active'::text THEN ca.campaign_id
                    ELSE NULL::uuid
                END), 0::bigint) AS inactive_campaign_count,
            COALESCE(count(
                CASE
                    WHEN cc.status::text = 'active'::text THEN cc.coupon_code_id
                    ELSE NULL::uuid
                END), 0::bigint) AS active_coupon_code_count,
            now() AS created_at,
            now() AS updated_at
        FROM organization o
        LEFT JOIN redemption r ON o.organization_id = r.organization_id
        LEFT JOIN coupon c ON o.organization_id = c.organization_id
        LEFT JOIN campaign ca ON c.coupon_id = ca.coupon_id
        LEFT JOIN coupon_code cc ON c.coupon_id = cc.coupon_id
        GROUP BY o.organization_id;
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
