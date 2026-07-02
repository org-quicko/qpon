import { Expose } from 'class-transformer';
import { Equals, IsDate, IsString } from 'class-validator';
import { roleEnum } from '../enums';

export class OrganizationUserDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.organization_user')
  entity = 'org.quicko.qpon.organization_user';

  @Expose({ name: 'organization_id' })
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  role: roleEnum;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}
