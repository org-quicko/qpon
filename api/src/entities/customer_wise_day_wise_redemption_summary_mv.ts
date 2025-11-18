import { ViewEntity, ViewColumn, Index } from 'typeorm';

@ViewEntity({
  name: 'customer_wise_day_wise_redemption_summary_mv',
  expression: `
    SELECT
      r.organization_id,
      r.customer_id,
      c.name AS customer_name,
      c.external_id AS customer_external_id,
      r.redemption_date AS date,

      COUNT(r.redemption_id)::numeric AS total_redemptions,

      SUM(r.base_order_value)::numeric AS gross_sale,
      SUM(r.discount)::numeric AS total_discount,
      SUM(r.base_order_value - r.discount)::numeric AS net_sale,

      NOW() AS created_at,
      NOW() AS updated_at
    FROM redemption r
    JOIN customer c ON c.customer_id = r.customer_id
    WHERE r.organization_id IS NOT NULL
      AND r.customer_id IS NOT NULL
    GROUP BY
      r.organization_id,
      r.customer_id,
      c.name,
      c.external_id,
      r.redemption_date
  `,
  materialized: true,
})
export class CustomerWiseDayWiseRedemptionSummaryMv {
  @Index()
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @ViewColumn({ name: 'customer_id' })
  customerId: string;

  @ViewColumn({ name: 'customer_name' })
  customerName: string;

  @ViewColumn({ name: 'customer_external_id' })
  customerExternalId: string;

  @Index()
  @ViewColumn({ name: 'date' })
  date: Date;

  @ViewColumn({ name: 'total_redemptions' })
  totalRedemptions: number;

  @ViewColumn({ name: 'gross_sale' })
  grossSale: number;

  @ViewColumn({ name: 'total_discount' })
  totalDiscount: number;

  @ViewColumn({ name: 'net_sale' })
  netSale: number;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
