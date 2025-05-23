import { email, prop, required } from '@rxweb/reactive-form-validators';
import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class CustomerDto {
  @Expose({ name: 'customer_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  customerId?: string;

  @IsString()
  name?: string;

  @IsString()
  email?: string;

  @IsOptional()
  @Expose({ name: 'isd_code' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  isdCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}

export class CreateCustomerDto {
  @prop()
  @required()
  @IsString()
  name?: string;

  @prop()
  @required()
  @email()
  @IsString()
  email?: string;

  @prop()
  @IsOptional()
  @Expose({ name: 'isd_code' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  isdCode?: string;

  @prop()
  @IsOptional()
  @IsString()
  phone?: string;

  @prop()
  @required()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;
}

export class UpdateCustomerDto {
  @prop()
  @IsOptional()
  @IsString()
  name?: string;

  @prop()
  @email()
  @IsOptional()
  @IsString()
  email?: string;

  @prop()
  @IsOptional()
  @Expose({ name: 'isd_code' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  isdCode?: string;

  @prop()
  @IsOptional()
  @IsString()
  phone?: string;

  @prop()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsOptional()
  @IsString()
  externalId?: string;
}
