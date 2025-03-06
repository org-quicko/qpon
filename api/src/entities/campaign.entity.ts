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
import { campaignStatusEnum } from 'src/enums';
import { Coupon } from './coupon.entity';
import { CouponCode } from './coupon-code.entity';
import { Redemption } from './redemption.entity';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn('uuid', { name: 'campaign_id' })
  campaignId: string;

  @Column()
  name: string;

  @Column('numeric', { nullable: true })
  budget: number;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

  @Column('enum', {
    enum: campaignStatusEnum,
    default: campaignStatusEnum.ACTIVE,
  })
  status: campaignStatusEnum;

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

  @ManyToOne(() => Coupon, (coupon) => coupon.campaigns, {
    onDelete: 'CASCADE',
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'coupon_id',
    referencedColumnName: 'couponId',
  })
  coupon: Coupon;

  @OneToMany(() => CouponCode, (couponCode) => couponCode.campaign, {
    onDelete: 'CASCADE',
    cascade: ['remove'],
  })
  couponCodes: CouponCode[];

  @OneToMany(() => Redemption, (redemption) => redemption.campaign)
  redemptions: Redemption[];
}
