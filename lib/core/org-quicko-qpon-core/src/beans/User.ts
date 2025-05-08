import { Expose, Transform } from 'class-transformer';
import { IsString, IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';
import { Role } from '../enums';

export class User {
  @Expose({ name: 'user_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  userId?: string;

  @IsString()
  name?: string;

  @IsString()
  email?: string;

  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Expose({ name: 'last_accessed_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  lastAccessedAt?: Date;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}
