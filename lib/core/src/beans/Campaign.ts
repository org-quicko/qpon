import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import {
  Equals,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

import { CampaignStatus } from '../enums'

@Reflect.metadata('@entity', 'org.quicko.qpon.campaign')
export class Campaign {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.campaign')
  entity = 'org.quicko.qpon.campaign';

  @Expose({ name: 'campaign_id' })
  @IsUUID()
  campaignId?: string;

  @Expose()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;

  @Expose({ name: 'external_id' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @Expose()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Type(() => Date)
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