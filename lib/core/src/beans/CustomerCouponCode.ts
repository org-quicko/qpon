import 'reflect-metadata';
import { Expose } from 'class-transformer';
import { Equals, IsArray, IsOptional, IsUUID } from 'class-validator';
import { Customer } from './Customer';

@Reflect.metadata('@entity', 'org.quicko.qpon.customer_coupon_code')
export class CustomerCouponCode {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.customer_coupon_code')
  entity = 'org.quicko.qpon.customer_coupon_code';

  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @IsUUID()
  couponCodeId?: string;

  @Expose()
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