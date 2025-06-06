import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRedemption {
  @IsString()
  code?: string;

  @Expose({ name: 'base_order_value' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsNumber()
  baseOrderValue?: number;

  @IsNumber()
  discount?: number;

  @Expose({ name: 'external_customer_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalCustomerId?: string;

  @Expose({ name: 'external_item_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalItemId?: string;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsOptional()
  @IsString()
  externalId?: string;

  getCode(): string | undefined {
    return this.code;
  }

  setCode(code: string): void {
    this.code = code;
  }

  getBaseOrderValue(): number | undefined {
    return this.baseOrderValue;
  }

  setBaseOrderValue(baseOrderValue: number): void {
    this.baseOrderValue = baseOrderValue;
  }

  getDiscount(): number | undefined {
    return this.discount;
  }

  setDiscount(discount: number): void {
    this.discount = discount;
  }

  getExternalCustomerId(): string | undefined {
    return this.externalCustomerId;
  }

  setExternalCustomerId(externalCustomerId: string): void {
    this.externalCustomerId = externalCustomerId;
  }

  getExternalItemId(): string | undefined {
    return this.externalItemId;
  }

  setExternalItemId(externalItemId: string): void {
    this.externalItemId = externalItemId;
  }

  getExternalId(): string | undefined {
    return this.externalId;
  }

  setExternalId(externalId: string): void {
    this.externalId = externalId;
  }
}