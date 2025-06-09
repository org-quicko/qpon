import { Expose, Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class ApiKeyDto {
  @Expose({ name: 'api_key_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  apiKeyId: string;

  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  secret: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: string;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: string;
}
