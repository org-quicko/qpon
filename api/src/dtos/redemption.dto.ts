import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRedemptionDto {
  @IsString()
  code: string;

  @IsNumber()
  amount: number;

  @Expose({ name: 'external_customer_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalCustomerId: string;

  @Expose({ name: 'external_item_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalItemId: string;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsOptional()
  @IsString()
  externalId?: string;
}
