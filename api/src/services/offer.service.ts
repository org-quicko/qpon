import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Offer } from '../entities/offer.view';
import { LoggerService } from './logger.service';
import { discountTypeEnum, sortOrderEnum } from '../enums';
import { OfferSheetConverter } from '../converters/offer-sheet.converter';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private offerSheetConverter: OfferSheetConverter,
    private logger: LoggerService,
  ) {}

  /**
   * Fetch offers
   */
  async fetchOffers(
    organizationId: string,
    externalItemId?: string,
    externalCustomerId?: string,
    sort?: sortOrderEnum,
    discountType?: discountTypeEnum,
    skip: number = 0,
    take: number = 10,
  ) {
    this.logger.info('START: fetchOffers service');
    try {
      const query: SelectQueryBuilder<Offer> =
        this.offersRepository.createQueryBuilder('offer');

      query.where(
        `offer.organization_id = :organizationId AND offer.visibility = 'public'`,
        {
          organizationId,
        },
      );

      if (externalItemId) {
        query.andWhere(
          '(offer.external_item_id = :externalItemId OR offer.external_item_id IS NULL)',
          { externalItemId },
        );
      }

      if (externalCustomerId) {
        query.andWhere(
          '(offer.external_customer_id = :externalCustomerId OR offer.external_customer_id IS NULL)',
          { externalCustomerId },
        );
      }

      if (discountType) {
        query.andWhere('offer.discount_type = :discountType', { discountType });
      }

      if (sort) {
        query.orderBy(`offer.discount_value`, sort);
      } else {
        query.orderBy('offer.discount_value', 'DESC');
      }

      query.skip(skip).take(take);

      const offers = await query.getMany();

      if (!offers || offers.length == 0) {
        this.logger.warn('Offers not found');
      }

      this.logger.info('END: fetchOffers service');
      return this.offerSheetConverter.convert(
        offers,
        organizationId,
        skip,
        take,
      );
    } catch (error) {
      this.logger.error(`Error in fetchOffers: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch offers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch offer
   */
  async fetchOffer(
    organizationId: string,
    code?: string,
    externalCustomerId?: string,
    externalItemId?: string,
  ) {
    this.logger.info('START: fetchOffer service');
    try {
      const query: SelectQueryBuilder<Offer> =
        this.offersRepository.createQueryBuilder('offer');

      query.where(
        `offer.organization_id = '${organizationId}' AND offer.code = '${code}' AND offer.coupon_code_status = 'active'`,
      );

      if (externalItemId && externalItemId !== 'all') {
        query.andWhere(`offer.external_item_id = '${externalItemId}'`);
      } else {
        query.andWhere(`offer.item_constraint = 'all'`);
      }

      if (externalCustomerId) {
        query.andWhere(`offer.external_customer_id = '${externalCustomerId}'`);
      } else {
        query.andWhere(`offer.customer_constraint = 'all'`);
      }

      const offers = await query.getOne();

      if (!offers) {
        this.logger.warn('Offer not found');
        throw new NotFoundException('Offer not found');
      }

      this.logger.info('END: fetchOffer service');
      return this.offerSheetConverter.convert([offers], organizationId);
    } catch (error) {
      this.logger.error(`Error in fetchOffer: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch offer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
