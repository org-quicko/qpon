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
import {
  customerConstraintEnum,
  discountTypeEnum,
  itemConstraintEnum,
  sortOrderEnum,
} from '../enums';
import { OfferSheetConverter } from '../converters/offer-sheet.converter';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';
import { CouponItem } from 'src/entities/coupon-item.entity';
import { Customer } from 'src/entities/customer.entity';
import { Item } from 'src/entities/item.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(CustomerCouponCode)
    private readonly customerCouponCodeRepository: Repository<CustomerCouponCode>,
    @InjectRepository(CouponItem)
    private readonly couponItemRepository: Repository<CouponItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
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
      const offer = await this.offersRepository.findOne({
        where: {
          organizationId,
          code,
        },
      });

      if (!offer) {
        this.logger.warn('Offer not found');
        throw new NotFoundException('Offer not found');
      }

      if (offer.itemConstraint === itemConstraintEnum.SPECIFIC) {
        const item = await this.itemRepository.findOne({
          where: {
            externalId: externalItemId,
            organization: {
              organizationId,
            },
          },
        });

        if (!item) {
          this.logger.warn('Item not found');
          throw new NotFoundException('Item not found');
        }

        const couponItem = await this.couponItemRepository.findOne({
          where: {
            itemId: item.itemId,
            coupon: {
              couponId: offer.couponId,
              organization: {
                organizationId,
              },
            },
          },
        });

        if (!couponItem) {
          this.logger.warn('Offer not found');
          throw new NotFoundException('Offer not found');
        }
      }

      if (offer.customerConstraint === customerConstraintEnum.SPECIFIC) {
        const customer = await this.customerRepository.findOne({
          where: {
            externalId: externalCustomerId,
            organization: {
              organizationId,
            },
          },
        });

        if (!customer) {
          this.logger.warn('Customer not found');
          throw new NotFoundException('Customer not found');
        }

        const customerCouponCode =
          await this.customerCouponCodeRepository.findOne({
            where: {
              couponCode: {
                code: offer.code,
                organization: {
                  organizationId,
                },
              },
              customerId: customer.customerId,
            },
          });

        if (!customerCouponCode) {
          this.logger.warn('Offer not found');
          throw new NotFoundException('Offer not found');
        }
      }

      this.logger.info('END: fetchOffer service');
      return this.offerSheetConverter.convert([offer], organizationId);
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
