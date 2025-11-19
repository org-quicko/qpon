import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import {
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
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Expose({ name: 'customer_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(customerConstraintEnum)
  customerConstraint: customerConstraintEnum;

  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions: number;

  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  minimumAmount: number;

  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptionPerCustomer: number;

  @IsEnum(visibilityEnum)
  visibility: visibilityEnum;

  @Expose({ name: 'duration_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(durationTypeEnum)
  durationType: durationTypeEnum;

  @IsOptional()
  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt: Date;

  @Expose({ name: 'redemption_count' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  redemptionCount: number;

  @Expose({ name: 'status' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(couponCodeStatusEnum)
  status: couponCodeStatusEnum;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateCouponCodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @Expose({ name: 'customer_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(customerConstraintEnum)
  customerConstraint: customerConstraintEnum;

  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions: number;

  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptionPerCustomer: number;

  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  minimumAmount: number;

  @IsEnum(visibilityEnum)
  visibility: visibilityEnum;

  @Expose({ name: 'duration_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(durationTypeEnum)
  durationType: durationTypeEnum;

  @IsOptional()
  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt: string;
}

export class UpdateCouponCodeDto extends PartialType(CreateCouponCodeDto) {}
