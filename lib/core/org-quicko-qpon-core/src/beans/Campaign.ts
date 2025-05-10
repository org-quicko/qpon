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

  getCampaignId(): string | undefined {
    return this.campaignId;
  }

  setCampaignId(campaignId: string): void {
    this.campaignId = campaignId;
  }

  getName(): string | undefined {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getBudget(): number | undefined {
    return this.budget;
  }

  setBudget(budget: number): void {
    this.budget = budget;
  }

  getExternalId(): string | undefined {
    return this.externalId;
  }

  setExternalId(externalId: string): void {
    this.externalId = externalId;
  }

  getStatus(): CampaignStatus | undefined {
    return this.status;
  }

  setStatus(status: CampaignStatus): void {
    this.status = status;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}