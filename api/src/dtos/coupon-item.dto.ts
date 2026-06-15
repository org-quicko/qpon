import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { Equals, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ItemDto } from './item.dto';

export class CouponItemDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_item')
  entity = 'org.quicko.qpon.coupon_item';

  @Expose({ name: 'coupon_id' })
  @IsUUID()
  couponId: string;

  @IsArray()
  item: ItemDto[];
}

export class CreateCouponItemDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_item')
  entity = 'org.quicko.qpon.coupon_item';

  @IsArray()
  items: string[];
}

export class UpdateCouponItemDto extends PartialType(CreateCouponItemDto) {}
