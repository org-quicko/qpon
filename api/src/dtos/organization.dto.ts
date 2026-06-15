import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { Allow, Equals, IsString, IsDate, IsOptional } from 'class-validator';

export class OrganizationDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.organization')
  entity = 'org.quicko.qpon.organization';

  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  currency: string;

  @IsOptional()
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

export class CreateOrganizationDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

  @IsString()
  name: string;

  @IsString()
  currency: string;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId: string;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
