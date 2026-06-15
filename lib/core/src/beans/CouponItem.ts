import 'reflect-metadata';
import { Expose } from 'class-transformer';
import { Equals, IsArray, IsUUID } from 'class-validator';
import { Item } from './Item';

@Reflect.metadata('@entity', 'org.quicko.qpon.coupon_item')
export class CouponItem {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_item')
  entity = 'org.quicko.qpon.coupon_item';

  @Expose({ name: 'coupon_id' })
  @IsUUID()
  couponId?: string;

  @IsArray()
  item?: Item[];

  getCouponId(): string | undefined {
    return this.couponId;
  }

  setCouponId(couponId: string): void {
    this.couponId = couponId;
  }

  getItem(): Item[] | undefined {
    return this.item;
  }

  setItem(item: Item[]): void {
    this.item = item;
  }
}