import { ViewEntity, ViewColumn, Index } from 'typeorm';

@ViewEntity({
  name: 'item_wise_day_wise_redemption_summary_mv',
  expression: `
    SELECT
      r.organization_id,
      r.item_id,
      i.name AS item_name,
      i.external_id AS external_item_id,
      r.redemption_date AS date,

      COUNT(r.redemption_id) AS total_redemptions,
      SUM(r.base_order_value) AS gross_sale,
      SUM(r.discount) AS total_discount,
      SUM(r.base_order_value - r.discount) AS net_sale,

      NOW() AS created_at,
      NOW() AS updated_at
    FROM redemption r
    JOIN item i ON i.item_id = r.item_id
    WHERE r.organization_id IS NOT NULL
      AND r.item_id IS NOT NULL
    GROUP BY
      r.organization_id,
      r.item_id,
      i.name,
      i.external_id,
      r.redemption_date
  `,
  materialized: true,
})
export class ItemWiseDayWiseRedemptionSummaryMv {
  @Index()
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @ViewColumn({ name: 'item_id' })
  itemId: string;

  @ViewColumn({ name: 'item_name' })
  itemName: string;

  @ViewColumn({ name: 'external_item_id' })
  externalItemId: string;

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
