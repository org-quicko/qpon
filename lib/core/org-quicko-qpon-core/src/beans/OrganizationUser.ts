import { Expose, Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { Role } from '../enums';

export class OrganizationUser {
  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  role?: Role;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}
