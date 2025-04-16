import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { customerConstraintEnum, couponCodeStatusEnum, durationTypeEnum, visibilityEnum, statusEnum } from '../enums';
import { prop, required } from '@rxweb/reactive-form-validators';

export class CouponCodeDto {
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId?: string;

  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: 'customer_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(customerConstraintEnum)
  customerConstraint?: customerConstraintEnum;

  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions?: number;

  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  minimumAmount?: number;

  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptionPerCustomer?: number;

  @IsEnum(visibilityEnum)
  visibility?: visibilityEnum;

  @Expose({ name: 'duration_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(durationTypeEnum)
  durationType?: durationTypeEnum;

  @IsOptional()
  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt?: Date;

  @Expose({ name: 'redemption_count' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  redemptionCount?: number;

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

export class CreateCouponCodeDto {
  @prop()
  @Expose({ name: 'code' })
  @IsString()
  code?: string;

  @prop()
  @Expose({ name: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @prop()
  @Expose({ name: 'customer_constraint' })
  @IsEnum(customerConstraintEnum)
  customerConstraint?: customerConstraintEnum;

  @prop()
  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  maxRedemptions?: number | null;

  @prop()
  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  maxRedemptionPerCustomer?: number | null;

  @prop()
  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  minimumAmount?: number | null;
  
  @prop()
  @Expose({ name: 'visibility' })
  @IsEnum(visibilityEnum)
  visibility?: visibilityEnum;

  @prop()
  @Expose({ name: 'duration_type' })
  @IsEnum(durationTypeEnum)
  durationType?: durationTypeEnum;

  @prop()
  @IsOptional()
  @Expose({ name: 'expires_at' })
  @IsString()
  expiresAt?: string;
}

export class UpdateCouponCodeDto {
  @prop()
  @IsOptional()
  @IsString()
  description?: string;

  @prop()
  @IsOptional()
  @Expose({ name: 'customer_constraint' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(customerConstraintEnum)
  customerConstraint?: customerConstraintEnum;

  @prop()
  @IsOptional()
  @Expose({ name: 'max_redemptions' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions?: number;

  @prop()
  @IsOptional()
  @Expose({ name: 'max_redemption_per_customer' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptionPerCustomer?: number;

  @prop()
  @IsOptional()
  @Expose({ name: 'minimum_amount' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  minimumAmount?: number;

  @prop()
  @IsOptional()
  @IsEnum(visibilityEnum)
  visibility?: visibilityEnum;

  @prop()
  @IsOptional()
  @Expose({ name: 'duration_type' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(durationTypeEnum)
  durationType?: durationTypeEnum;

  @prop()
  @IsOptional()
  @Expose({ name: 'expires_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt?: string;
}
