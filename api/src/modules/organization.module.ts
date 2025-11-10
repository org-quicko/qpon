import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from '../services/organization.service';
import { OrganizationController } from '../controllers/organization.controller';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';
import { OrganizationConverter } from '../converters/organization.converter';
import { OrganizationSummaryWorkbookConverter } from '../converters/organization-summary';
import { OrganizationsMv } from 'src/entities/organizations_mv.entity';
import { OrganizationsListConverter } from 'src/converters/organizations-list-converter';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';
import { ItemsSummaryWorkbookConverter } from 'src/converters/items-summary';
import { CouponCodesWiseDayWiseRedemptionSummaryMv } from 'src/entities/coupon-codes-wise-day-wise-redemption-summary-mv';
import { CouponCodeSummaryWorkbookConverter } from 'src/converters/coupon-codes-summary';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';
import { RedemptionSummaryWorkbookConverter } from 'src/converters/day-wise-redemption-summary';
import { RedemptionSummaryTableConverter } from 'src/converters/day-wise-redemption-summary/redemption-summary-table.converter';
import { RedemptionSummaryListConverter } from 'src/converters/day-wise-redemption-summary/redemption-summary-list.converter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationUser,
      OrganizationSummaryMv,
      OrganizationsMv,
      ItemWiseDayWiseRedemptionSummaryMv,
      CouponCodesWiseDayWiseRedemptionSummaryMv,
      DayWiseRedemptionSummaryMv,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationConverter,
    OrganizationSummaryWorkbookConverter,
    OrganizationsListConverter,
    ItemsSummaryWorkbookConverter,
    CouponCodeSummaryWorkbookConverter,
    RedemptionSummaryWorkbookConverter,
    RedemptionSummaryTableConverter,
    RedemptionSummaryListConverter,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
