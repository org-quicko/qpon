import { Expose, Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { prop } from '@rxweb/reactive-form-validators';
import { CustomerDto } from './customer.dto';

export class CustomerCouponCodeDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.customer_coupon_code';

  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId?: string;

  @IsArray()
  customers?: CustomerDto[];
}

export class CreateCustomerCouponCodeDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.customer_coupon_code';

  @prop()
  @IsArray()
  customers?: string[];
}

export class UpdateCustomerCouponCodeDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.customer_coupon_code';

  @prop()
  @IsArray()
  customers?: string[];
}
