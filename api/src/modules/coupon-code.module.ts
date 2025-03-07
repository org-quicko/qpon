import { Module } from '@nestjs/common';
import { CouponCodeService } from '../services/coupon-code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponCodeController } from '../controllers/coupon-code.controller';
import { CouponCode } from '../entities/coupon-code.entity';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { CouponCodeConverter } from '../converters/coupon-code.converter';
import { CouponCodeSheetConverter } from '../converters/coupon-code-sheet.converter';

@Module({
  imports: [TypeOrmModule.forFeature([CouponCode, CustomerCouponCode])],
  controllers: [CouponCodeController],
  providers: [CouponCodeService, CouponCodeConverter, CouponCodeSheetConverter],
})
export class CouponCodeModule {}
