import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import {
  Allow,
  Equals,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

import { visibilityEnum } from '../enums/visibility.enum';
import { durationTypeEnum } from '../enums/durationType.enum';
import { couponCodeStatusEnum } from '../enums/couponCodeStatus.enum';
import { customerConstraintEnum } from 'src/enums';

export class CouponCodeDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_code')
  entity = 'org.quicko.qpon.coupon_code';

  @Expose({ name: 'coupon_code_id' })
  @IsUUID()
  couponCodeId: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Expose({ name: 'customer_constraint' })
  @IsEnum(customerConstraintEnum)
  customerConstraint: customerConstraintEnum;

  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @IsNumber()
  maxRedemptions: number;

  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @IsNumber()
  minimumAmount: number;

  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @IsNumber()
  maxRedemptionPerCustomer: number;

  @IsEnum(visibilityEnum)
  visibility: visibilityEnum;

  @Expose({ name: 'duration_type' })
  @IsEnum(durationTypeEnum)
  durationType: durationTypeEnum;

  @IsOptional()
  @Expose({ name: 'expires_at' })
  @IsString()
  expiresAt: Date;

  @Expose({ name: 'redemption_count' })
  @IsNumber()
  redemptionCount: number;

  @Expose({ name: 'status' })
  @IsEnum(couponCodeStatusEnum)
  status: couponCodeStatusEnum;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateCouponCodeDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @Expose({ name: 'customer_constraint' })
  @IsEnum(customerConstraintEnum)
  customerConstraint: customerConstraintEnum;

  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @IsNumber()
  maxRedemptions: number;

  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @IsNumber()
  maxRedemptionPerCustomer: number;

  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @IsNumber()
  minimumAmount: number;

  @IsEnum(visibilityEnum)
  visibility: visibilityEnum;

  @Expose({ name: 'duration_type' })
  @IsEnum(durationTypeEnum)
  durationType: durationTypeEnum;

  @IsOptional()
  @Expose({ name: 'expires_at' })
  @IsString()
  expiresAt: string;
}

export class UpdateCouponCodeDto extends PartialType(CreateCouponCodeDto) {}
