import { Module } from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from '../controllers/coupon.controller';
import { Coupon } from '../entities/coupon.entity';
import { CouponItem } from '../entities/coupon-item.entity';
import { CouponSummaryMv } from '../entities/coupon-summary.view';
import { CouponConverter } from '../converters/coupon.converter';
import { ItemConverter } from '../converters/item.converter';
import { CouponSummarySheetConverter } from '../converters/coupon-summary-sheet.converter';
import { CouponListConverter } from 'src/converters/coupon-list.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponItem, CouponSummaryMv])],
  controllers: [CouponController],
  providers: [
    CouponService,
    CouponConverter,
    ItemConverter,
    CouponSummarySheetConverter,
    CouponListConverter,
  ],
  exports: [CouponService],
})
export class CouponModule {}
