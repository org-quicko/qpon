import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { Equals, IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class CustomerDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.customer')
  entity = 'org.quicko.qpon.customer';

  @Expose({ name: 'customer_id' })
  @IsUUID()
  customerId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @Expose({ name: 'isd_code' })
  @IsString()
  isdCode: string;

  @IsOptional()
  @IsString()
  phone: string;

  @Expose({ name: 'external_id' })
  @IsString()
  externalId: string;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateCustomerDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.customer')
  entity = 'org.quicko.qpon.customer';

  @IsString()
  name?: string;

  @IsString()
  email?: string;

  @IsOptional()
  @Expose({ name: 'isd_code' })
  @IsString()
  isdCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @Expose({ name: 'external_id' })
  @IsString()
  externalId?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
