import 'reflect-metadata';
import { Expose } from 'class-transformer';
import { Equals, IsNumber, IsOptional, IsString } from 'class-validator';

@Reflect.metadata('@entity', 'org.quicko.qpon.redemption')
export class CreateRedemption {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.redemption')
  entity = 'org.quicko.qpon.redemption';

  @IsString()
  code: string;

  @Expose({ name: 'base_order_value' })
  @IsNumber()
  baseOrderValue: number;

  @IsNumber()
  discount: number;

  @Expose({ name: 'external_customer_id' })
  @IsString()
  externalCustomerId: string;

  @Expose({ name: 'external_item_id' })
  @IsString()
  externalItemId: string;

  @Expose({ name: 'external_id' })
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