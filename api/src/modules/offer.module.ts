import { Module } from '@nestjs/common';
import { OffersService } from '../services/offer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from '../controllers/offer.controller';
import { Offer } from '../entities/offer.view';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
