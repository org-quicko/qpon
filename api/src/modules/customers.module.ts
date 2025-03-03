import { Module } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controllers/customers.controller';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
