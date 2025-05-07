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
}