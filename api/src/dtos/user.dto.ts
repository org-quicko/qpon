import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { IsString, IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';
import { roleEnum } from '../enums';

export class UserDto {
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
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(roleEnum)
  role: roleEnum;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
