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

  getCouponCodeId(): string | undefined {
    return this.couponCodeId;
  }

  setCouponCodeId(couponCodeId: string): void {
    this.couponCodeId = couponCodeId;
  }

  getCode(): string | undefined {
    return this.code;
  }

  setCode(code: string): void {
    this.code = code;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getCustomerConstraint(): CustomerConstraint | undefined {
    return this.customerConstraint;
  }

  setCustomerConstraint(customerConstraint: CustomerConstraint): void {
    this.customerConstraint = customerConstraint;
  }

  getMaxRedemptions(): number | undefined {
    return this.maxRedemptions;
  }

  setMaxRedemptions(maxRedemptions: number): void {
    this.maxRedemptions = maxRedemptions;
  }

  getMinimumAmount(): number | undefined {
    return this.minimumAmount;
  }

  setMinimumAmount(minimumAmount: number): void {
    this.minimumAmount = minimumAmount;
  }

  getMaxRedemptionPerCustomer(): number | undefined {
    return this.maxRedemptionPerCustomer;
  }

  setMaxRedemptionPerCustomer(maxRedemptionPerCustomer: number): void {
    this.maxRedemptionPerCustomer = maxRedemptionPerCustomer;
  }

  getVisibility(): Visibility | undefined {
    return this.visibility;
  }

  setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }

  getDurationType(): DurationType | undefined {
    return this.durationType;
  }

  setDurationType(durationType: DurationType): void {
    this.durationType = durationType;
  }

  getExpiresAt(): Date | undefined {
    return this.expiresAt;
  }

  setExpiresAt(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  getRedemptionCount(): number | undefined {
    return this.redemptionCount;
  }

  setRedemptionCount(redemptionCount: number): void {
    this.redemptionCount = redemptionCount;
  }

  getStatus(): CouponCodeStatus | undefined {
    return this.status;
  }

  setStatus(status: CouponCodeStatus): void {
    this.status = status;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}