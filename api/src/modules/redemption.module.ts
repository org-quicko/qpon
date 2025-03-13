import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsService } from '../services/redemption.service';
import { RedemptionsController } from '../controllers/redemption.controller';
import { Redemption } from '../entities/redemption.entity';
import { RedemptionSheetConverter } from '../converters/redemption-sheet.converter';
import { RedemptionReportSheetConverter } from '../converters/redemption-report-sheet.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Redemption])],
  controllers: [RedemptionsController],
  providers: [
    RedemptionsService,
    RedemptionSheetConverter,
    RedemptionReportSheetConverter,
  ],
})
export class RedemptionsModule {}
