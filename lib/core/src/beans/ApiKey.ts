import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { Equals, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@Reflect.metadata('@entity', 'org.quicko.qpon.api_key')
export class ApiKey {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.api_key')
  entity = 'org.quicko.qpon.api_key';

  @Expose({ name: 'api_key_id' })
  @IsUUID()
  apiKeyId?: string;

  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  secret?: string;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

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

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}
