import { Injectable } from '@nestjs/common';
import { CampaignDto } from '../dtos';
import { Campaign } from '../entities/campaign.entity';

@Injectable()
export class CampaignConverter {
  convert(campaign: Campaign): CampaignDto {
    const campaignDto = new CampaignDto();

    campaignDto.campaignId = campaign.campaignId;
    campaignDto.name = campaign.name;
    campaignDto.budget = campaign.budget;
    campaignDto.externalId = campaign.externalId;
    campaignDto.status = campaign.status;
    campaignDto.createdAt = campaign.createdAt;
    campaignDto.updatedAt = campaign.updatedAt;

    return campaignDto;
  }
}
