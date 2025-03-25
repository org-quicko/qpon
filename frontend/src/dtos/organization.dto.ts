import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsOptional } from 'class-validator';

export class OrganizationDto {
  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  currency?: string;

  @Expose({ name: 'theme_colour' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  themeColour?: string;

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

export class CreateOrganizationDto {
  @IsString()
  name?: string;

  @IsString()
  currency?: string;

  @Expose({ name: 'theme_colour' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  themeColour?: string;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Expose({ name: 'theme_colour' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  themeColour?: string;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;
}
