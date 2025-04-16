import { Expose, Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { prop } from '@rxweb/reactive-form-validators';
import { CustomerDto } from './customer.dto';

export class CustomerCouponCodeDto {
  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId?: string;

  @IsArray()
  customers?: CustomerDto[];
}

export class CreateCustomerCouponCodeDto {
  @prop()
  @IsArray()
  customers?: string[];
}

export class UpdateCustomerCouponCodeDto {
  @prop()
  @IsArray()
  customers?: string[];
}
