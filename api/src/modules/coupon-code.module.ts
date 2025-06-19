import { Module } from '@nestjs/common';
import { CouponCodeService } from '../services/coupon-code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponCodeController } from '../controllers/coupon-code.controller';
import { CouponCode } from '../entities/coupon-code.entity';
import { CouponCodeConverter } from '../converters/coupon-code.converter';
import { CouponCodeWorkbookConverter } from '../converters/coupon-code';
import { CouponCodeListConverter } from 'src/converters/coupon-code-list.converter';

@Module({
  imports: [TypeOrmModule.forFeature([CouponCode])],
  controllers: [CouponCodeController],
  providers: [
    CouponCodeService,
    CouponCodeConverter,
    CouponCodeWorkbookConverter,
    CouponCodeListConverter,
  ],
  exports: [CouponCodeService],
})
export class CouponCodeModule {}
