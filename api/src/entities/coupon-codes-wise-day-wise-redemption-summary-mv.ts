import { ViewEntity, ViewColumn, Index } from 'typeorm';

@ViewEntity({
  name: 'coupon_codes_wise_day_wise_redemption_summary_mv',
  expression: `
    SELECT
      r.organization_id,
      r.coupon_code_id,
      c.code AS coupon_code,
      r.redemption_date AS date,
      COUNT(r.redemption_id)::numeric AS total_redemptions,
      NOW() AS created_at,
      NOW() AS updated_at
    FROM redemption r
    JOIN coupon_code c ON c.coupon_code_id = r.coupon_code_id
    WHERE r.organization_id IS NOT NULL
      AND r.coupon_code_id IS NOT NULL
    GROUP BY
      r.organization_id,
      r.coupon_code_id,
      c.code,
      r.redemption_date
  `,
  materialized: true,
})
export class CouponCodesWiseDayWiseRedemptionSummaryMv {
  @Index()
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @ViewColumn({ name: 'coupon_code_id' })
  couponCodeId: string;

  @ViewColumn({ name: 'coupon_code' })
  couponCode: string;

  @Index()
  @ViewColumn({ name: 'date' })
  date: Date;

  @ViewColumn({ name: 'total_redemptions' })
  totalRedemptions: number;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
