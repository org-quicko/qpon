import { Expose, Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';
import { Item } from './Item';

export class CouponItem {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId?: string;

  @IsArray()
  item?: Item[];
}