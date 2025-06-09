import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  visibilityEnum,
} from '../enums';
import { Campaign } from './campaign.entity';
import { Coupon } from './coupon.entity';
import { CustomerCouponCode } from './customer-coupon-code.entity';
import { Redemption } from './redemption.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'coupon_code' })
export class CouponCode {
  @PrimaryGeneratedColumn('uuid', { name: 'coupon_code_id' })
  couponCodeId: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column('enum', { name: 'customer_constraint', enum: customerConstraintEnum })
  customerConstraint: customerConstraintEnum;

  @Column({ name: 'max_redemptions', nullable: true })
  maxRedemptions: number;

  @Column('numeric', { name: 'minimum_amount', nullable: true })
  minimumAmount: number;

  @Column({ name: 'max_redemption_per_customer', nullable: true })
  maxRedemptionPerCustomer: number;

  @Column('enum', { enum: visibilityEnum, default: visibilityEnum.PUBLIC })
  visibility: visibilityEnum;

  @Column('enum', { name: 'duration_type', enum: durationTypeEnum })
  durationType: durationTypeEnum;

  @Column('timestamp with time zone', { name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'redemption_count', default: 0 })
  redemptionCount: number;

  @Column('enum', {
    enum: couponCodeStatusEnum,
    default: couponCodeStatusEnum.ACTIVE,
  })
  status: couponCodeStatusEnum;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => `now()`,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => `now()`,
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.couponCodes)
  @JoinColumn({
    name: 'campaign_id',
    referencedColumnName: 'campaignId',
  })
  campaign: Campaign;

  @ManyToOne(() => Coupon, (coupon) => coupon.couponCodes, {
    onDelete: 'CASCADE',
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'coupon_id',
    referencedColumnName: 'couponId',
  })
  coupon: Coupon;

  @ManyToOne(() => Organization, (organization) => organization.couponCodes)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @OneToMany(
    () => CustomerCouponCode,
    (customerCouponCode) => customerCouponCode.couponCode,
  )
  customerCouponCodes: CustomerCouponCode[];

  @OneToMany(() => Redemption, (redemption) => redemption.couponCode)
  redemptions: Redemption[];
}
