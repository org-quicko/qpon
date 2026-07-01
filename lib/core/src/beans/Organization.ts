import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { Equals, IsString, IsDate, IsOptional } from 'class-validator';

@Reflect.metadata('@entity', 'org.quicko.qpon.organization')
export class Organization {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.organization')
  entity = 'org.quicko.qpon.organization';

  @Expose({ name: 'organization_id' })
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  currency?: string;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @IsString()
  externalId?: string;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  getOrganizationId(): string | undefined {
    return this.organizationId;
  }

  setOrganizationId(organizationId: string): void {
    this.organizationId = organizationId;
  }

  getName(): string | undefined {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getCurrency(): string | undefined {
    return this.currency;
  }

  setCurrency(currency: string): void {
    this.currency = currency;
  }

  getExternalId(): string | undefined {
    return this.externalId;
  }

  setExternalId(externalId: string): void {
    this.externalId = externalId;
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
