import { discountTypeEnum } from '../enums/discountType.enum';
import { itemConstraintEnum } from '../enums/itemConstraint.enum';
import { statusEnum } from '../enums/status.enum';

import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ItemDto } from './item.dto';

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

  @IsArray()
  items: ItemDto[];

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

  @IsOptional()
  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto: number;

  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items: string[];
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto: number;

  @IsOptional()
  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items: string[];
}
