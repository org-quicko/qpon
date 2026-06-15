import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { Allow, Equals, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ItemDto } from './item.dto';

export class CouponItemDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_item')
  entity = 'org.quicko.qpon.coupon_item';

  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId: string;

  @IsArray()
  item: ItemDto[];
}

export class CreateCouponItemDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

  @IsArray()
  items: string[];
}

export class UpdateCouponItemDto extends PartialType(CreateCouponItemDto) {}
