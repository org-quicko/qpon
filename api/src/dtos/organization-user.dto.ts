import { Expose, Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { roleEnum } from '../enums';

export class OrganizationUserDto {
  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  role: roleEnum;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}
