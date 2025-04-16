import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { maxLength, prop, required } from "@rxweb/reactive-form-validators";
import { statusEnum, itemConstraintEnum, discountTypeEnum } from '../enums';

export class CouponDto {
  @Expose({ name: 'coupon_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponId?: string;

  @IsString()
  name?: string;

  @Expose({ name: 'discount_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(discountTypeEnum)
  discountType?: discountTypeEnum;

  @Expose({ name: 'discount_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  discountValue?: string;

  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  discountUpto?: string;

  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint?: itemConstraintEnum;

  @IsEnum(statusEnum)
  status?: statusEnum;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}

export class CreateCouponDto {
  @prop()
  @IsString()
  name?: string;

  @prop()
  @Expose({ name: 'discount_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(discountTypeEnum)
  discountType?: discountTypeEnum;

  @prop()
  @Expose({ name: 'discount_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountValue?: number;

  @prop()
  @IsOptional()
  @Expose({ name: 'discount_upto' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  discountUpto?: number;

  @prop()
  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint?: itemConstraintEnum;
}

export class UpdateCouponDto {
  @prop()
  @required()
  @IsOptional()
  @IsString()
  name?: string;

  @prop()
  @IsOptional()
  @Expose({ name: 'item_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(itemConstraintEnum)
  itemConstraint?: itemConstraintEnum;
}
