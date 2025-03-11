import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { OffersService } from '../services/offer.service';
import {} from '../dtos';
import { discountTypeEnum, sortOrderEnum } from 'src/enums';
import { LoggerService } from '../services/logger.service';

@ApiTags('Offers')
@Controller('/organizations/:organization_id')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private logger: LoggerService,
  ) {}

  /**
   * Fetch offers
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('offers')
  async fetchOffers(
    @Param('organization_id') organizationId: string,
    @Query('external_item_id') externalItemId?: string,
    @Query('external_customer_id') externalCustomerId?: string,
    @Query('sort') sort?: sortOrderEnum,
    @Query('discount_type') discountType?: discountTypeEnum,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchOffers controller');

    const result = await this.offersService.fetchOffers(
      organizationId,
      externalItemId,
      externalCustomerId,
      sort,
      discountType,
      skip,
      take,
    );

    this.logger.info('END: fetchOffers controller');
    return { message: 'Successfully fetched offers', result };
  }

  /**
   * Fetch offer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('offer')
  async fetchOffer(
    @Param('organization_id') organizationId: string,
    @Query('code') code?: string,
    @Query('external_customer_id') externalCustomerId?: string,
    @Query('external_item_id') externalItemId?: string,
  ) {
    this.logger.info('START: fetchOffer controller');

    const result = await this.offersService.fetchOffer(
      organizationId,
      code,
      externalCustomerId,
      externalItemId,
    );

    this.logger.info('END: fetchOffer controller');
    return { message: 'Successfully fetched offer', result };
  }
}
