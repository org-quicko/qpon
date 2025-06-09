import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';
import { ItemDto } from './item.dto';

export class CouponItemDto {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId: string;

  @IsArray()
  item: ItemDto[];
}

export class CreateCouponItemDto {
  @IsArray()
  items: string[];
}

export class UpdateCouponItemDto extends PartialType(CreateCouponItemDto) {}
