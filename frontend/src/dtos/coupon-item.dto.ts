import { Expose, Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';
import { ItemDto } from './item.dto';
import { prop } from '@rxweb/reactive-form-validators';

export class CouponItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.coupon_item';

  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId?: string;

  @IsArray()
  items?: ItemDto[];
}

export class CreateCouponItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.coupon_item';

  @prop()
  @IsArray()
  items?: string[];
}

export class UpdateCouponItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.coupon_item';

  @prop()
  @IsArray()
  items?: string[];
}
