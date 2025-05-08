import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

import { CampaignStatus } from '../enums'

export class Campaign {
  @Expose({ name: 'campaign_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  campaignId?: string;

  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsOptional()
  @IsString()
  externalId?: string;

  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;
}