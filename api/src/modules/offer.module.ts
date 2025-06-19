import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from '../services/offer.service';
import { OffersController } from '../controllers/offer.controller';
import { Offer } from '../entities/offer.view';
import { OfferWorkbookConverter } from '../converters/offer';
import { Customer } from '../entities/customer.entity';
import { Item } from '../entities/item.entity';
import { CouponItem } from '../entities/coupon-item.entity';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { CouponCode } from '../entities/coupon-code.entity';
import { Redemption } from '../entities/redemption.entity';
import { CampaignSummaryMv } from 'src/entities/campaign-summary.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Customer,
      Item,
      CouponItem,
      CustomerCouponCode,
      CouponCode,
      Redemption,
      CampaignSummaryMv
    ]),
  ],
  controllers: [OffersController],
  providers: [OffersService, OfferWorkbookConverter],
})
export class OffersModule {}
