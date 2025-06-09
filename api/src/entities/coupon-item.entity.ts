import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Coupon } from './coupon.entity';

@Entity({ name: 'coupon_item' })
export class CouponItem {
  @PrimaryColumn({ name: 'coupon_id' })
  couponId: string;

  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

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

  @ManyToOne(() => Item, (item) => item.couponItems)
  @JoinColumn({
    name: 'item_id',
    referencedColumnName: 'itemId',
  })
  item: Item;

  @ManyToOne(() => Coupon, (coupon) => coupon.couponItems)
  @JoinColumn({
    name: 'coupon_id',
    referencedColumnName: 'couponId',
  })
  coupon: Coupon;
}
