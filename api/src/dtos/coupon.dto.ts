import { discountTypeEnum } from '../enums/discountType.enum';
import { itemConstraintEnum } from '../enums/itemConstraint.enum';
import { statusEnum } from '../enums/status.enum';

import { Expose } from 'class-transformer';
import {
  Equals,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CouponDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon')
  entity = 'org.quicko.qpon.coupon';

  @Expose({ name: 'coupon_id' })
  @IsUUID()
  couponId: string;

  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Discount type should not be empty' })
  @Expose({ name: 'discount_type' })
  @IsEnum(discountTypeEnum)
  discountType: discountTypeEnum;

  @IsNotEmpty({ message: 'Discount value should not be empty' })
  @Expose({ name: 'discount_value' })
  @IsNumber({allowNaN: false, allowInfinity: false}, { message: 'Discount value should be a number' })
  discountValue: number;

  @Expose({ name: 'discount_upto' })
  @IsNumber()
  discountUpto: number;

  @IsNotEmpty({ message: 'Item constraint should not be empty' })
  @Expose({ name: 'item_constraint' })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;

  @IsEnum(statusEnum)
  status: statusEnum;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateCouponDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon')
  entity = 'org.quicko.qpon.coupon';

  @IsString()
  name: string;

  @Expose({ name: 'discount_type' })
  @IsEnum(discountTypeEnum)
  discountType: discountTypeEnum;

  @Expose({ name: 'discount_value' })
  @IsNumber()
  discountValue: number;

  @IsOptional()
  @Expose({ name: 'discount_upto' })
  @IsNumber()
  discountUpto: number;

  @Expose({ name: 'item_constraint' })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;
}

export class UpdateCouponDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon')
  entity = 'org.quicko.qpon.coupon';

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Expose({ name: 'discount_upto' })
  @IsNumber()
  discountUpto: number;

  @IsOptional()
  @Expose({ name: 'item_constraint' })
  @IsEnum(itemConstraintEnum)
  itemConstraint: itemConstraintEnum;
}
