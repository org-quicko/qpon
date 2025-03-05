import { Module } from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from '../controllers/coupon.controller';
import { Coupon } from '../entities/coupon.entity';
import { CouponItem } from '../entities/coupon-item.entity';
import { CouponSummaryMv } from '../entities/coupon-summary.view';
import { CouponConverter } from 'src/converters/coupon.converter';
import { ItemConverter } from 'src/converters/item.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponItem, CouponSummaryMv])],
  controllers: [CouponController],
  providers: [CouponService, CouponConverter, ItemConverter],
})
export class CouponModule {}
