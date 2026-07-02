import { Expose } from 'class-transformer';
import { Equals, IsString, IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';
import { roleEnum } from '../enums';

export class UserDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.user')
  entity = 'org.quicko.qpon.user';

  @Expose({ name: 'user_id' })
  @IsUUID()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(roleEnum)
  role: roleEnum;

  @IsOptional()
  @Expose({ name: 'last_accessed_at' })
  @IsDate()
  lastAccessedAt: Date;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateUserDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.user')
  entity = 'org.quicko.qpon.user';

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(roleEnum)
  role: roleEnum;
}

export class UpdateUserDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.user')
  entity = 'org.quicko.qpon.user';

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  currentPassword: string;

  @IsOptional()
  @IsString()
  newPassword: string;
}

export class UpdateUserRoleDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.user')
  entity = 'org.quicko.qpon.user';

  @IsEnum(roleEnum)
  role: roleEnum;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
