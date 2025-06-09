import { Module } from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignController } from '../controllers/campaign.controller';
import { Campaign } from '../entities/campaign.entity';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';
import { CampaignConverter } from '../converters/campaign.converter';
import { CampaignSummarySheetConverter } from '../converters/campaign-summary-sheet.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignSummaryMv])],
  controllers: [CampaignController],
  providers: [
    CampaignService,
    CampaignConverter,
    CampaignSummarySheetConverter,
  ],
  exports: [CampaignService],
})
export class CampaignModule {}
