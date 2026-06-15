import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import {
  Equals,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

import { campaignStatusEnum } from '../enums/campaignStatus.enum';

export class CampaignDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.campaign')
  entity = 'org.quicko.qpon.campaign';

  @Expose({ name: 'campaign_id' })
  @IsUUID()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  budget: number;

  @Expose({ name: 'external_id' })
  @IsOptional()
  @IsString()
  externalId: string;

  @IsEnum(campaignStatusEnum)
  status: campaignStatusEnum;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @IsDate()
  updatedAt: Date;
}

export class CreateCampaignDto {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.campaign')
  entity = 'org.quicko.qpon.campaign';

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  budget: number;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @IsString()
  externalId: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
