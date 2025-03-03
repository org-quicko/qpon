import { Module } from '@nestjs/common';
import { CouponCodeService } from '../services/coupon-code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponCodeController } from '../controllers/coupon-code.controller';
import { CouponCode } from '../entities/coupon-code.entity';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponCode, CustomerCouponCode])],
  controllers: [CouponCodeController],
  providers: [CouponCodeService],
})
export class CouponCodeModule {}
