import { statusEnum } from 'src/enums';
import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'coupon_summary_day_wise_mv' })
export class CouponDaySummaryMv {
  @PrimaryColumn({ name: 'coupon_id', type: 'uuid' })
  couponId: string;

  @PrimaryColumn({ name: 'date', type: 'date' })
  date: Date;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({
    name: 'total_redemption_count',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  totalRedemptionCount: number;

  @Column({
    name: 'total_redemption_amount',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  totalRedemptionAmount: number;

  @Column({
    name: 'active_coupon_code_count',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  activeCouponCodeCount: number;

  @Column({
    name: 'redeemed_coupon_code_count',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  redeemedCouponCodeCount: number;

  @Column({
    name: 'active_campaign_count',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  activeCampaignCount: number;

  @Column({
    name: 'total_campaign_count',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  totalCampaignCount: number;

  @Column({
    name: 'budget',
    type: 'numeric',
    default: 0,
    transformer: {
      from: (value: any) => (value !== null ? Number(value) : null),
      to: (value: any) => value,
    },
  })
  budget: number | null;

  @Index()
  @Column({
    name: 'status',
    type: 'varchar',
    nullable: true,
  })
  status: statusEnum | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updatedAt: Date;
}
