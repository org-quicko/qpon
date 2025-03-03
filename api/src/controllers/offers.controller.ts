import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { OffersService } from '../services/offers.service';
import {} from '../dtos';

@ApiTags('Offers')
@Controller('')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Fetch offers
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('offers')
  async fetchOffers(
    @Query('external_item_id') externalItemId?: number,
    @Query('external_customer_id') externalCustomerId?: string,
    @Query('sort') sort?: string,
    @Query('discount_type') discountType?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.offersService.fetchOffers(
      externalItemId,
      externalCustomerId,
      sort,
      discountType,
      skip,
      take,
    );
  }

  /**
   * Fetch offer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('offer')
  async fetchOffer(
    @Query('external_id') externalId?: string,
    @Query('code') code?: string,
    @Query('item_id') itemId?: string,
  ) {
    return this.offersService.fetchOffer(externalId, code, itemId);
  }
}
