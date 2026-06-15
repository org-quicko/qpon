import 'reflect-metadata';
import { Expose } from 'class-transformer';
import { Equals, IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

@Reflect.metadata('@entity', 'org.quicko.qpon.customer')
export class Customer {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.customer')
  entity = 'org.quicko.qpon.customer';

  @Expose({ name: 'customer_id' })
  @IsUUID()
  customerId?: string;

  @IsString()
  name?: string;

  @IsString()
  email?: string;

  @IsOptional()
  @Expose({ name: 'isd_code' })
  @IsString()
  isdCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @Expose({ name: 'external_id' })
  @IsString()
  externalId?: string;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt?: Date;

  getCustomerId(): string | undefined {
    return this.customerId;
  }

  setCustomerId(customerId: string): void {
    this.customerId = customerId;
  }

  getName(): string | undefined {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  getIsdCode(): string | undefined {
    return this.isdCode;
  }

  setIsdCode(isdCode: string): void {
    this.isdCode = isdCode;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  setPhone(phone: string): void {
    this.phone = phone;
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