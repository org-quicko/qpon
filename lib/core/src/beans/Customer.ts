import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class Customer {
  @Expose({ name: 'customer_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  customerId?: string;

  @IsString()
  name?: string;

  @IsString()
  email?: string;

  @IsOptional()
  @Expose({ name: 'isd_code' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  isdCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
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