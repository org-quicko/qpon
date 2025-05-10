import { Expose, Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class ApiKey {
  @Expose({ name: 'api_key_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  apiKeyId?: string;

  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  secret?: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: string;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: string;

  getApiKeyId(): string | undefined {
    return this.apiKeyId;
  }

  setApiKeyId(apiKeyId: string): void {
    this.apiKeyId = apiKeyId;
  }

  getKey(): string | undefined {
    return this.key;
  }

  setKey(key: string): void {
    this.key = key;
  }

  getSecret(): string | undefined {
    return this.secret;
  }

  setSecret(secret: string): void {
    this.secret = secret;
  }

  getCreatedAt(): string | undefined {
    return this.createdAt;
  }

  setCreatedAt(createdAt: string): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): string | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: string): void {
    this.updatedAt = updatedAt;
  }
}
