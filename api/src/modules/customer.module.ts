import { Module } from '@nestjs/common';
import { CustomersService } from '../services/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controllers/customer.controller';
import { Customer } from '../entities/customer.entity';
import { CustomerConverter } from '../converters/customer.converter';
import { CustomerListConverter } from '../converters/customer-list.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerConverter, CustomerListConverter],
  exports: [CustomersService],
})
export class CustomersModule {}
