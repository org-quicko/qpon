import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CouponCode } from './coupon-code.entity';
import { Campaign } from './campaign.entity';
import { Coupon } from './coupon.entity';
import { Organization } from './organization.entity';
import { Customer } from './customer.entity';
import { Item } from './item.entity';

@Entity()
export class Redemption {
  @PrimaryGeneratedColumn('uuid', { name: 'redemption_id' })
  redemptionId: string;

  @Column({ name: 'base_order_value', type: 'numeric' })
  baseOrderValue: number;

  @Column('numeric')
  discount: number;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

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

  @ManyToOne(() => CouponCode, (couponCode) => couponCode.redemptions)
  @JoinColumn({
    name: 'coupon_code_id',
    referencedColumnName: 'couponCodeId',
  })
  couponCode: CouponCode;

  @ManyToOne(() => Campaign, (campaign) => campaign.redemptions)
  @JoinColumn({
    name: 'campaign_id',
    referencedColumnName: 'campaignId',
  })
  campaign: Campaign;

  @ManyToOne(() => Coupon, (coupon) => coupon.redemptions)
  @JoinColumn({
    name: 'coupon_id',
    referencedColumnName: 'couponId',
  })
  coupon: Coupon;

  @ManyToOne(() => Customer, (customer) => customer.redemptions)
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'customerId',
  })
  customer: Customer;

  @ManyToOne(() => Item, (item) => item.redemptions)
  @JoinColumn({
    name: 'item_id',
    referencedColumnName: 'itemId',
  })
  item: Item;

  @ManyToOne(() => Organization, (organization) => organization.redemptions)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;
}
