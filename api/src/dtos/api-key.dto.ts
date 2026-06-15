import { Expose, Transform } from 'class-transformer';
import { Equals, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class ApiKeyDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.api_key')
  entity = 'org.quicko.qpon.api_key';

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
