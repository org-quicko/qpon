import { discountTypeEnum } from '../enums/discountType.enum';
import { itemConstraintEnum } from '../enums/itemConstraint.enum';
import { statusEnum } from '../enums/status.enum';

import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
} from 'class-validator';

export class CouponDto {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId: string;

  @IsString()
  name: string;

  @Expose({ name: 'discount_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(discountTypeEnum)
  discountType: discountTypeEnum;

  @Expose({ name: 'discount_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountValue: number;

  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto: number;

  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

  items: string[];

  @IsEnum(statusEnum)
  status: statusEnum;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateCouponDto {
  @IsString()
  name: string;

  @Expose({ name: 'discount_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(discountTypeEnum)
  discountType: discountTypeEnum;

  @Expose({ name: 'discount_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountValue: number;

  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto: number;

  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

  @IsArray()
  @IsString({ each: true })
  items: string[];

  @IsEnum(statusEnum)
  status: statusEnum;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
