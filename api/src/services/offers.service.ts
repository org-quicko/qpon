import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.view';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
  ) {}

  /**
   * Fetch offers
   */
  async fetchOffers(
    externalItemId?: number,
    externalCustomerId?: string,
    sort?: string,
    discountType?: string,
    skip?: number,
    take?: number,
  ) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch offer
   */
  async fetchOffer(externalId?: string, code?: string, itemId?: string) {
    throw new Error('Method not implemented.');
  }
}
