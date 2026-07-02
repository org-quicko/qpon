import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';
import { prop, required } from '@rxweb/reactive-form-validators';

export class ItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.item';

  @Expose({ name: 'item_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  itemId?: string;

  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields?: any;

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
}

export class CreateItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.item';

  @prop()
  @required()
  @IsString()
  name?: string;

  @prop()
  @IsOptional()
  @IsString()
  description?: string;

  @prop()
  @IsOptional()
  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields?: object;

  @prop()
  @required()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;
}

export class UpdateItemDto {
  @Expose({ name: '@entity' })
  entity?: string = 'org.quicko.qpon.item';

  @prop()
  @IsOptional()
  @IsString()
  name?: string;
  
  @prop()
  @IsOptional()
  @IsString()
  description?: string;
 
  @prop()
  @IsOptional()
  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields?: any;
  
  @prop()
  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId?: string;
}
