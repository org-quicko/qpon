import { ViewEntity, ViewColumn, Index } from 'typeorm';

@ViewEntity({
    name: 'day_wise_redemption_summary_mv',
    expression: `
    SELECT
      r.organization_id,
      r.redemption_date AS date,
      COUNT(r.redemption_id)::numeric AS total_redemptions_count,
      COALESCE(SUM(r.base_order_value), 0)::integer AS gross_sales_amount,
      COALESCE(SUM(r.discount), 0)::integer AS discount_amount,
      COALESCE(SUM(r.base_order_value - r.discount), 0)::integer AS net_sales_amount,
      NOW() AS created_at,
      NOW() AS updated_at
    FROM redemption r
    WHERE r.organization_id IS NOT NULL
    GROUP BY r.organization_id, r.redemption_date
  `,
    materialized: true,
})
export class DayWiseRedemptionSummaryMv {
    @Index()
    @ViewColumn({ name: 'organization_id' })
    organizationId: string;

    @Index()
    @ViewColumn({ name: 'date' })
    date: Date;

    @ViewColumn({ name: 'total_redemptions_count' })
    totalRedemptionsCount: number;

    @ViewColumn({ name: 'gross_sales_amount' })
    grossSalesAmount: number;

    @ViewColumn({ name: 'discount_amount' })
    discountAmount: number;

    @ViewColumn({ name: 'net_sales_amount' })
    netSalesAmount: number;

    @ViewColumn({ name: 'created_at' })
    createdAt: Date;

    @ViewColumn({ name: 'updated_at' })
    updatedAt: Date;
}
