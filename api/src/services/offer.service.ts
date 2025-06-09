import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Offer } from '../entities/offer.view';
import { LoggerService } from './logger.service';
import {
  customerConstraintEnum,
  discountTypeEnum,
  itemConstraintEnum,
  sortOrderEnum,
  visibilityEnum,
} from '../enums';
import { OfferSheetConverter } from '../converters/offer-sheet.converter';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';
import { CouponItem } from 'src/entities/coupon-item.entity';
import { Customer } from 'src/entities/customer.entity';
import { Item } from 'src/entities/item.entity';
import { Redemption } from 'src/entities/redemption.entity';
import { CouponCode } from 'src/entities/coupon-code.entity';
import { CampaignSummaryMv } from 'src/entities/campaign-summary.view';

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
    @InjectRepository(CouponCode)
    private readonly couponCodeRepository: Repository<CouponCode>,
    @InjectRepository(Redemption)
    private readonly redemptionRepository: Repository<Redemption>,
    @InjectRepository(CampaignSummaryMv)
    private readonly campaignSummaryRepository: Repository<CampaignSummaryMv>,
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
      const allOffers = await this.offersRepository.find({
        where: {
          organizationId,
          visibility: visibilityEnum.PUBLIC,
          discountType,
        },
        skip,
        take,
        order: {
          discountValue: sort === sortOrderEnum.ASC ? 'ASC' : 'DESC',
        },
      });

      if (!allOffers || allOffers.length === 0) {
        this.logger.warn('No offers found');
        return this.offerSheetConverter.convert([], organizationId, skip, take);
      }

      const couponIdsForSpecificItems: string[] = [];
      const couponCodeIdsForSpecificCustomers: string[] = [];

      for (const offer of allOffers) {
        if (offer.itemConstraint === itemConstraintEnum.SPECIFIC) {
          couponIdsForSpecificItems.push(offer.couponId);
        }
        if (offer.customerConstraint === customerConstraintEnum.SPECIFIC) {
          couponCodeIdsForSpecificCustomers.push(offer.couponCodeId);
        }
      }

      let relevantItem: Item | null = null;
      let relevantCustomer: Customer | null = null;
      let matchingCouponItems: CouponItem[] = [];
      let matchingCustomerCouponCodes: CustomerCouponCode[] = [];

      if (externalItemId && couponIdsForSpecificItems.length > 0) {
        relevantItem = await this.itemRepository.findOne({
          where: {
            externalId: externalItemId,
            organization: { organizationId },
          },
        });

        if (relevantItem) {
          matchingCouponItems = await this.couponItemRepository.find({
            where: {
              itemId: relevantItem.itemId,
              couponId: In(couponIdsForSpecificItems),
            },
          });
        }
      }

      if (externalCustomerId && couponCodeIdsForSpecificCustomers.length > 0) {
        relevantCustomer = await this.customerRepository.findOne({
          where: {
            externalId: externalCustomerId,
            organization: { organizationId },
          },
        });

        if (relevantCustomer) {
          matchingCustomerCouponCodes = await this.customerCouponCodeRepository.find({
            where: {
              customerId: relevantCustomer.customerId,
              couponCodeId: In(couponCodeIdsForSpecificCustomers),
            },
          });
        }
      }

      const itemCouponSet = new Set(
        matchingCouponItems.map(ci => `${ci.couponId}-${ci.itemId}`)
      );
      const customerCouponCodeSet = new Set(
        matchingCustomerCouponCodes.map(ccc => `${ccc.couponCodeId}-${ccc.customerId}`)
      );

      const eligibleOffers: Offer[] = [];

      for (const offer of allOffers) {        
        let isOfferEligible = false;
        let finalItemId: string | undefined;
        let finalExternalItemId: string | undefined;
        let finalCustomerId: string | undefined;
        let finalExternalCustomerId: string | undefined;


        // Condition 1: ALL item and ALL customer constraints
        if (
          offer.itemConstraint === itemConstraintEnum.ALL &&
          offer.customerConstraint === customerConstraintEnum.ALL
        ) {
          isOfferEligible = true;
        }
        // Condition 2: ALL item, SPECIFIC customer
        else if (
          offer.itemConstraint === itemConstraintEnum.ALL &&
          offer.customerConstraint === customerConstraintEnum.SPECIFIC &&
          externalCustomerId && relevantCustomer
        ) {
  
          if (customerCouponCodeSet.has(`${offer.couponCodeId}-${relevantCustomer.customerId}`)) {
            isOfferEligible = true;
            finalCustomerId = relevantCustomer.customerId;
            finalExternalCustomerId = relevantCustomer.externalId;
          }
        }
        // Condition 3: SPECIFIC item, ALL customer
        else if (
          offer.itemConstraint === itemConstraintEnum.SPECIFIC &&
          offer.customerConstraint === customerConstraintEnum.ALL &&
          externalItemId && relevantItem
        ) {
          if (itemCouponSet.has(`${offer.couponId}-${relevantItem.itemId}`)) {
            isOfferEligible = true;
            finalItemId = relevantItem.itemId;
            finalExternalItemId = relevantItem.externalId;
          }
        }
        // Condition 4: SPECIFIC item, SPECIFIC customer
        else if (
          offer.itemConstraint === itemConstraintEnum.SPECIFIC &&
          offer.customerConstraint === customerConstraintEnum.SPECIFIC &&
          externalItemId && relevantItem &&
          externalCustomerId && relevantCustomer
        ) {
          if (
            itemCouponSet.has(`${offer.couponId}-${relevantItem.itemId}`) &&
            customerCouponCodeSet.has(`${offer.couponCodeId}-${relevantCustomer.customerId}`)
          ) {
            isOfferEligible = true;
            finalItemId = relevantItem.itemId;
            finalExternalItemId = relevantItem.externalId;
            finalCustomerId = relevantCustomer.customerId;
            finalExternalCustomerId = relevantCustomer.externalId;
          }
        }

        if (isOfferEligible) {
          const offerObject = this.buildOfferObject(
            offer,
            finalExternalCustomerId,
            finalExternalItemId,
            finalItemId,
            finalCustomerId
          );
          eligibleOffers.push(offerObject);
        }
      }

      this.logger.info('END: fetchOffers service');
      return this.offerSheetConverter.convert(
        eligibleOffers,
        organizationId,
        skip,
        take,
      );
    } catch (error) {
      this.logger.error(`Error in fetchOffers:`, error);
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
    code: string,
    externalCustomerId: string,
    externalItemId: string,
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

      const item = await this.itemRepository.findOne({
        where: {
          externalId: externalItemId,
          organization: {
            organizationId,
          },
        },
      });

      const customer = await this.customerRepository.findOne({
        where: {
          externalId: externalCustomerId,
          organization: {
            organizationId,
          },
        },
      });

      if (offer.itemConstraint === itemConstraintEnum.SPECIFIC && item) {
        if (item) {
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
            this.logger.warn('Item is ineligible for the offer');
            throw new ConflictException('Item is ineligible for the offer');
          }
        } 
      } else {
          this.logger.warn('Item is ineligible for the offer');
          throw new ConflictException('Item is ineligible for the offer');
      }

      if (
        customer &&
        offer.customerConstraint === customerConstraintEnum.SPECIFIC
      ) {
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
          this.logger.warn('Customer is ineligible for the offer');
          throw new ConflictException('Customer is ineligible for the offer');
        }
      } else {
        this.logger.warn('Customer is ineligible for the offer');
        throw new ConflictException('Customer is ineligible for the offer');
      }

      if (customer) {
        const couponCode = await this.couponCodeRepository.findOne({
          where: {
            code: offer.code,
            organization: {
              organizationId,
            },
          },
        });

        if (!couponCode) {
          this.logger.warn('Coupon code not found');
          throw new NotFoundException('Coupon code not found');
        }

        if (couponCode.maxRedemptionPerCustomer > 0) {
          const redemptionsCount = await this.redemptionRepository.count({
            where: {
              couponCode: {
                couponCodeId: couponCode.couponCodeId,
              },
              customer: {
                customerId: customer.customerId,
              },
              organization: {
                organizationId,
              },
            },
          });

          if (redemptionsCount >= couponCode.maxRedemptionPerCustomer) {
            this.logger.warn(
              'Coupon code is already redeemed maximum number of time',
            );
            throw new ConflictException(
              'Coupon code is already redeemed maximum number of time',
            );
          }
        }
      }

      this.logger.info('END: fetchOffer service');
      return this.offerSheetConverter.convert([offer], organizationId);
    } catch (error) {
      this.logger.error(`Error in fetchOffer:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch offer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  buildOfferObject(
    offer: Offer,
    externalCustomerId?: string,
    externalItemId?: string,
    itemId?: string,
    customerId?: string,
  ) {
    const offerObject: Offer = {
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      itemConstraint: offer.itemConstraint,
      customerConstraint: offer.customerConstraint,
      visibility: offer.visibility,
      organizationId: offer.organizationId,
      couponId: offer.couponId,
      campaignId: offer.campaignId,
      discountUpto: offer.discountUpto,
      minimumAmount: offer.minimumAmount,
      itemId: offer.itemId,
      customerId: offer.customerId,
      externalCampaignId: offer.externalCampaignId,
      couponCodeStatus: offer.couponCodeStatus,
      expiresAt: offer.expiresAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      externalItemId: offer.externalItemId,
      externalCustomerId: offer.externalCustomerId,
      couponCodeId: offer.couponCodeId,
      maxRedemptionPerCustomer: offer.maxRedemptionPerCustomer
    };

    if (
      offer.itemConstraint === itemConstraintEnum.SPECIFIC &&
      externalItemId && itemId
    ) {
      offerObject.itemId = itemId;
      offerObject.externalItemId = externalItemId;
    }

    if (
      offer.customerConstraint === customerConstraintEnum.SPECIFIC &&
      externalCustomerId && customerId
    ) {
      offerObject.customerId = customerId;
      offerObject.externalCustomerId = externalCustomerId;
    }

    return offerObject;
  }
}
