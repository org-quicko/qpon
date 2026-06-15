import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { Allow, Equals, IsString, IsDate, IsOptional } from 'class-validator';

export class OrganizationDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.organization')
  entity = 'org.quicko.qpon.organization';

  @Expose({ name: 'organization_id' })
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  currency: string;

  @IsOptional()
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
  @IsString()
  externalId: string;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
