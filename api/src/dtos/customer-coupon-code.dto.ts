import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { Allow, Equals, IsArray, IsOptional, IsUUID } from 'class-validator';
import { CustomerDto } from './customer.dto';

export class CustomerCouponCodeDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.customer_coupon_code')
  entity = 'org.quicko.qpon.customer_coupon_code';

  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId: string;

  @IsArray()
  customers: CustomerDto[];
}

export class CreateCustomerCouponCodeDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

  @IsArray()
  customers: string[];
}

export class UpdateCustomerCouponCodeDto extends PartialType(
  CreateCustomerCouponCodeDto,
) {}
