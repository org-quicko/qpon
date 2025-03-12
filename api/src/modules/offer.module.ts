import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from '../services/offer.service';
import { OffersController } from '../controllers/offer.controller';
import { Offer } from '../entities/offer.view';
import { OfferSheetConverter } from '../converters/offer-sheet.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [OffersController],
  providers: [OffersService, OfferSheetConverter],
})
export class OffersModule {}
