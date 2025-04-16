import { Expose, Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';
import { ItemDto } from './item.dto';
import { prop } from '@rxweb/reactive-form-validators';

export class CouponItemDto {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId?: string;

  @IsArray()
  items?: ItemDto[];
}

export class CreateCouponItemDto {
  @prop()
  @IsArray()
  items?: string[];
}

export class UpdateCouponItemDto {
  @prop()
  @IsArray()
  items?: string[];
}
