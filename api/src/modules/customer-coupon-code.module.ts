import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCouponCodeController } from '../controllers/customer-coupon-code.controller';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { CustomerCouponCodeService } from '../services/customer-coupon-code.service';
import { CustomerCouponCodeConverter } from '../converters/customer-coupon-code.converter';
import { CustomersService } from '../services/customer.service';
import { CustomerConverter } from '../converters/customer.converter';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerCouponCode, Customer])],
  controllers: [CustomerCouponCodeController],
  providers: [
    CustomerCouponCodeService,
    CustomersService,
    CustomerCouponCodeConverter,
    CustomerConverter,
  ],
})
export class CustomerCouponCodeModule {}
