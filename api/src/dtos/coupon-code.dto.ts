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

export class CouponCodeDto {
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId: string;

  @IsString()
  code: string;

  @IsString()
  description: string;

  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions: number;

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

  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt: string;

  @Expose({ name: 'expires_after_billing_cycle' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  expiresAfterBillingCycle: number;

  @Expose({ name: 'redemption_count' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  redemptionCount: number;

  @Expose({ name: 'coupon-code-status' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(couponCodeStatusEnum)
  couponCodeStatus: couponCodeStatusEnum;

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

  @IsString()
  description: string;

  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions: number;

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

  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt: string;

  @Expose({ name: 'expires_after_billing_cycle' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  expiresAfterBillingCycle: number;

  @Expose({ name: 'redemption_count' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  redemptionCount: number;

  @Expose({ name: 'coupon-code-status' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(couponCodeStatusEnum)
  couponCodeStatus: couponCodeStatusEnum;
}

export class UpdateCouponCodeDto extends PartialType(CreateCouponCodeDto) {}
