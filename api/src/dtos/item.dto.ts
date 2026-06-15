import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { Allow, Equals, IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class ItemDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.item')
  entity = 'org.quicko.qpon.item';

  @Expose({ name: 'item_id' })
  @IsUUID()
  itemId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @Expose({ name: 'custom_fields' })
  customFields: any;

  @Expose({ name: 'external_id' })
  externalId: string;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateItemDto {
  @Expose({ name: '@entity' })
  @Allow()
  @IsOptional()
  entity?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Expose({ name: 'custom_fields' })
  customFields: any;

  @Expose({ name: 'external_id' })
  @IsString()
  externalId: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
