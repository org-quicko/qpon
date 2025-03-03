import { Module } from '@nestjs/common';
import { OffersService } from '../services/offers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from '../controllers/offers.controller';
import { Offer } from '../entities/offer.view';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
