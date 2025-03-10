import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { CustomerDto } from './customer.dto';

export class CustomerCouponCodeDto {
  @IsOptional()
  @Expose({ name: 'coupon_code_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  couponCodeId: string;

  @IsArray()
  customers: CustomerDto[];
}

export class CreateCustomerCouponCodeDto {
  @IsArray()
  customers: string[];
}

export class UpdateCustomerCouponCodeDto extends PartialType(
  CreateCustomerCouponCodeDto,
) {}
