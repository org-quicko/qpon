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
import { discountTypeEnum, itemConstraintEnum, statusEnum } from '../enums';
import { Organization } from './organization.entity';
import { Campaign } from './campaign.entity';
import { CouponItem } from './coupon-item.entity';
import { CouponCode } from './coupon-code.entity';
import { Redemption } from './redemption.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid', { name: 'coupon_id' })
  couponId: string;

  @Column()
  name: string;

  @Column('enum', {
    name: 'item_constraint',
    enum: itemConstraintEnum,
    default: itemConstraintEnum.ALL,
  })
  itemConstraint: itemConstraintEnum;

  @Column('enum', { name: 'discount_type', enum: discountTypeEnum })
  discountType: discountTypeEnum;

  @Column('numeric', { name: 'discount_value' })
  discountValue: number;

  @Column('numeric', { name: 'discount_upto', nullable: true })
  discountUpto: number;

  @Column('enum', { enum: statusEnum, default: statusEnum.ACTIVE })
  status: statusEnum;

  @CreateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.coupons)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @OneToMany(() => Campaign, (campaign) => campaign.coupon)
  campaigns: Campaign[];

  @OneToMany(() => CouponItem, (couponItem) => couponItem.coupon)
  couponItems: CouponItem[];

  @OneToMany(() => CouponCode, (couponCode) => couponCode.coupon)
  couponCodes: CouponCode[];

  @OneToMany(() => Redemption, (redemption) => redemption.coupon)
  redemptions: Redemption[];
}
