import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsOptional } from 'class-validator';

export class Organization {
  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  currency?: string;

  @IsOptional()
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
