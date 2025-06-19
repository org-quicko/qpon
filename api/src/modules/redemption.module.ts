import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsService } from '../services/redemption.service';
import { RedemptionsController } from '../controllers/redemption.controller';
import { Redemption } from '../entities/redemption.entity';
import { RedemptionWorkbookConverter } from '../converters/redemption';
import { RedemptionReportWorkbookConverter } from '../converters/redemption-report';
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
    RedemptionWorkbookConverter,
    RedemptionReportWorkbookConverter,
  ],
})
export class RedemptionsModule {}
