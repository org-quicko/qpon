import { Expose } from 'class-transformer';
import { Allow, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRedemptionDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

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
}
