import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class Customer {
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