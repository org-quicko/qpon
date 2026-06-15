import { Expose, Transform } from 'class-transformer';
import { Allow, Equals, IsString, IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';
import { roleEnum } from '../enums';

export class UserDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.user')
  entity = 'org.quicko.qpon.user';

  @Expose({ name: 'user_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
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
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  lastAccessedAt: Date;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateUserDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

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
  @Allow()
  @IsOptional()
  entity?: string;

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
  @Allow()
  @IsOptional()
  entity?: string;

  @IsEnum(roleEnum)
  role: roleEnum;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
