import { discountTypeEnum } from '../enums/discountType.enum';
import { itemConstraintEnum } from '../enums/itemConstraint.enum';
import { statusEnum } from '../enums/status.enum';

import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CouponDto {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId: string;

  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Discount type should not be empty' })
  @Expose({ name: 'discount_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(discountTypeEnum)
  discountType: discountTypeEnum;

  @IsNotEmpty({ message: 'Discount value should not be empty' })
  @Expose({ name: 'discount_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber({allowNaN: false, allowInfinity: false}, { message: 'Discount value should be a number' })
  discountValue: number;

  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto: number;

  @IsNotEmpty({ message: 'Item constraint should not be empty' })
  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

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
}
