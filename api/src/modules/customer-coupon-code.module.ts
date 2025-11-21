import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCouponCodeController } from '../controllers/customer-coupon-code.controller';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { CustomerCouponCodeService } from '../services/customer-coupon-code.service';
import { CustomerCouponCodeConverter } from '../converters/customer-coupon-code.converter';
import { CustomersService } from '../services/customer.service';
import { CustomerConverter } from '../converters/customer.converter';
import { Customer } from '../entities/customer.entity';
import { CustomerListConverter } from 'src/converters/customer-list.converter';
import { CustomerWiseDayWiseRedemptionSummaryMv } from 'src/entities/customer_wise_day_wise_redemption_summary_mv';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerCouponCode, Customer, CustomerWiseDayWiseRedemptionSummaryMv])],
  controllers: [CustomerCouponCodeController],
  providers: [
    CustomerCouponCodeService,
    CustomersService,
    CustomerCouponCodeConverter,
    CustomerConverter,
    CustomerListConverter,
  ],
  exports: [CustomerCouponCodeService],
})
export class CustomerCouponCodeModule {}
