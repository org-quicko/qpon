import 'reflect-metadata';
import { Expose } from "class-transformer";
import {
  Equals,
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

@Reflect.metadata('@entity', 'org.quicko.qpon.coupon_code')
export class CouponCode {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.coupon_code')
  entity = 'org.quicko.qpon.coupon_code';

  @Expose({ name: "coupon_code_id" })
  @IsUUID()
  couponCodeId?: string;

  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: "customer_constraint" })
  @IsEnum(CustomerConstraint)
  customerConstraint?: CustomerConstraint;

  @IsOptional()
  @Expose({ name: "max_redemptions" })
  @IsNumber()
  maxRedemptions?: number;

  @IsOptional()
  @Expose({ name: "minimum_amount" })
  @IsNumber()
  minimumAmount?: number;

  @IsOptional()
  @Expose({ name: "max_redemption_per_customer" })
  @IsNumber()
  maxRedemptionPerCustomer?: number;

  @IsEnum(Visibility)
  visibility?: Visibility;

  @Expose({ name: "duration_type" })
  @IsEnum(DurationType)
  durationType?: DurationType;

  @IsOptional()
  @Expose({ name: "expires_at" })
  @IsString()
  expiresAt?: Date;

  @Expose({ name: "redemption_count" })
  @IsNumber()
  redemptionCount?: number;

  @Expose({ name: "coupon_code_status" })
  @IsEnum(CouponCodeStatus)
  status?: CouponCodeStatus;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: "updated_at" })
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