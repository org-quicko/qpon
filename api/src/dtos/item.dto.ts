import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class ItemDto {
  @Expose({ name: 'item_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  itemId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields: any;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields: any;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
