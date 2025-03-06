import { Module } from '@nestjs/common';
import { CustomersService } from '../services/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controllers/customer.controller';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
