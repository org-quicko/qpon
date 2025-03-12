import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class CustomerDto {
  @Expose({ name: 'customer_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  customerId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
