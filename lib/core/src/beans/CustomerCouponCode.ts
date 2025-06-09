import { Expose, Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { Customer } from './Customer';

export class CustomerCouponCode {
  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId?: string;

  @IsArray()
  customers?: Customer[];

  getCouponCodeId(): string | undefined {
    return this.couponCodeId;
  }

  setCouponCodeId(couponCodeId: string): void {
    this.couponCodeId = couponCodeId;
  }

  getCustomers(): Customer[] | undefined {
    return this.customers;
  }

  setCustomers(customers: Customer[]): void {
    this.customers = customers;
  }
}