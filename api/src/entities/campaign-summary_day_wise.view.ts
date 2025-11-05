import { campaignStatusEnum } from 'src/enums';
import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'campaign_summary_day_wise_mv' })
export class CampaignDaySummaryMv {
  @PrimaryColumn({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  // primary key (composite with campaign_id)
  @PrimaryColumn({ name: 'date', type: 'date' })
  date: Date;

  @Index()
  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string | null;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric', nullable: true })
  budget: number | null;

  @Column({ name: 'total_redemption_count', type: 'numeric', default: 0 })
  totalRedemptionCount: number;

  @Column({ name: 'total_redemption_amount', type: 'numeric', default: 0 })
  totalRedemptionAmount: number;

  @Column({ name: 'active_coupon_code_count', type: 'numeric', default: 0 })
  activeCouponCodeCount: number;

  @Index()
  @Column({ type: 'varchar' })
  status: campaignStatusEnum;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
