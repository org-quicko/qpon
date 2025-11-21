import { Module } from '@nestjs/common';
import { CustomersService } from '../services/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controllers/customer.controller';
import { Customer } from '../entities/customer.entity';
import { CustomerConverter } from '../converters/customer.converter';
import { CustomerListConverter } from '../converters/customer-list.converter';
import { CustomerWiseDayWiseRedemptionSummaryMv } from 'src/entities/customer_wise_day_wise_redemption_summary_mv';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerWiseDayWiseRedemptionSummaryMv])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerConverter, CustomerListConverter],
  exports: [CustomersService],
})
export class CustomersModule {}
