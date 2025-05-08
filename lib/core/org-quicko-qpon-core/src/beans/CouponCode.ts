import { Expose, Transform } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from "class-validator";
import {
  CustomerConstraint,
  CouponCodeStatus,
  DurationType,
  Visibility,
} from "../enums";

export class CouponCode {
  @Expose({ name: "coupon_code_id" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId?: string;

  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: "customer_constraint" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(CustomerConstraint)
  customerConstraint?: CustomerConstraint;

  @IsOptional()
  @Expose({ name: "max_redemptions" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptions?: number;

  @IsOptional()
  @Expose({ name: "minimum_amount" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  minimumAmount?: number;

  @IsOptional()
  @Expose({ name: "max_redemption_per_customer" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  maxRedemptionPerCustomer?: number;

  @IsEnum(Visibility)
  visibility?: Visibility;

  @Expose({ name: "duration_type" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(DurationType)
  durationType?: DurationType;

  @IsOptional()
  @Expose({ name: "expires_at" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  expiresAt?: Date;

  @Expose({ name: "redemption_count" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  redemptionCount?: number;

  @Expose({ name: "coupon_code_status" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsEnum(CouponCodeStatus)
  status?: CouponCodeStatus;

  @Expose({ name: "created_at" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: "updated_at" })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}