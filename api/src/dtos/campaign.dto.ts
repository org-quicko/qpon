import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

import { campaignStatusEnum } from '../enums/campaignStatus.enum';

export class CampaignDto {
  @Expose({ name: 'campaign_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  budget: number;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsOptional()
  @IsString()
  externalId: string;

  @IsEnum(campaignStatusEnum)
  status: campaignStatusEnum;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt: Date;
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  budget: number;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsString()
  externalId: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
