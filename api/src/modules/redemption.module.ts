import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsService } from '../services/redemption.service';
import { RedemptionsController } from '../controllers/redemption.controller';
import { Redemption } from '../entities/redemption.entity';
import { RedemptionSheetConverter } from '../converters/redemption-sheet.converter';
import { RedemptionReportSheetConverter } from '../converters/redemption-report-sheet.converter';
import { CouponCode } from '../entities/coupon-code.entity';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';
import { Campaign } from '../entities/campaign.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Redemption,
      CouponCode,
      CampaignSummaryMv,
      Campaign,
    ]),
  ],
  controllers: [RedemptionsController],
  providers: [
    RedemptionsService,
    RedemptionSheetConverter,
    RedemptionReportSheetConverter,
  ],
})
export class RedemptionsModule {}
