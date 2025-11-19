import {
  BadRequestException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';
import { format as csvFormat } from '@fast-csv/format';
import { Redemption } from '../entities/redemption.entity';
import { LoggerService } from './logger.service';
import { CreateRedemptionDto } from '../dtos/redemption.dto';
import { CouponCode } from '../entities/coupon-code.entity';
import {
  campaignStatusEnum,
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  itemConstraintEnum,
  sortOrderEnum,
} from '../enums';
import { Customer } from '../entities/customer.entity';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { Coupon } from '../entities/coupon.entity';
import { Item } from '../entities/item.entity';
import { CouponItem } from '../entities/coupon-item.entity';
import { Campaign } from '../entities/campaign.entity';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';
import { RedemptionWorkbookConverter } from '../converters/redemption';
import { PassThrough } from 'stream';
import { formatDateReport } from 'src/utils/date.utils';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(Redemption)
    private readonly redemptionsRepository: Repository<Redemption>,
    @InjectRepository(CouponCode)
    private readonly couponCodeRepository: Repository<CouponCode>,
    @InjectRepository(CampaignSummaryMv)
    private readonly campaignSummaryRepository: Repository<CampaignSummaryMv>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private redemptionWorkbookConverter: RedemptionWorkbookConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) { }

  /**
   * Redeem coupon code
   */
  async redeemCouponCode(organizationId: string, body: CreateRedemptionDto) {
    this.logger.info('START: redeemCouponCode service');
    let couponCodeId: string | undefined;
    let campaignId: string | undefined;
    try {
      const result = await this.datasource.transaction(async (manager) => {
        const couponCode = await manager.findOne(CouponCode, {
          relations: {
            coupon: true,
            campaign: true,
          },
          where: {
            code: body.code,
            status: Not(couponCodeStatusEnum.ARCHIVE),
            organization: {
              organizationId,
            },
          },
        });

        campaignId = couponCode?.campaign.campaignId;

        if (!couponCode) {
          this.logger.warn('Coupon code not found', { code: body.code });
          throw new NotFoundException('Coupon code not found');
        }

        this.validateCouponCode(couponCode);

        const customerId = await this.validateCustomer(
          manager,
          body.externalCustomerId,
          couponCode,
        );

        const itemId = await this.validateItem(
          manager,
          body.externalItemId,
          couponCode.coupon,
        );

        await this.validateCampaignBudget(manager, couponCode.campaign);

        await manager.increment(
          CouponCode,
          { couponCodeId: couponCode.couponCodeId },
          'redemptionCount',
          1,
        );

        await this.checkCouponCodeRedemptions(
          manager,
          couponCode,
          customerId,
          body.baseOrderValue,
        );

        couponCodeId = couponCode.couponCodeId;

        const savedRedemption = await this.saveRedemption(
          manager,
          couponCode,
          organizationId,
          customerId,
          itemId,
          body.baseOrderValue,
          body.discount,
          body.externalId,
        );

        return savedRedemption;
      });

      if (couponCodeId) {
        const updatedCouponCode = await this.couponCodeRepository.findOne({
          where: { couponCodeId },
        });
        if (
          updatedCouponCode &&
          updatedCouponCode.maxRedemptions &&
          updatedCouponCode.redemptionCount >=
          updatedCouponCode.maxRedemptions &&
          updatedCouponCode.status !== couponCodeStatusEnum.REDEEMED
        ) {
          await this.couponCodeRepository.update(couponCodeId, {
            status: couponCodeStatusEnum.REDEEMED,
          });
        }
      }

      if (campaignId) {
        const campaign_summary = await this.campaignSummaryRepository.findOne({
          where: {
            campaignId
          },
        });

        if (
          campaign_summary?.budget &&
          campaign_summary?.totalRedemptionAmount >= campaign_summary?.budget
        ) {
          await this.campaignRepository.update(campaignId, {
            status: campaignStatusEnum.EXHAUSTED,
          });

          await this.couponCodeRepository.update({ campaign: { campaignId }, status: couponCodeStatusEnum.ACTIVE }, { status: couponCodeStatusEnum.INACTIVE });
        }
      }
      this.logger.info('END: redeemCouponCode service');
      return result;
    } catch (error) {
      this.logger.error(`Error in redeemCouponCode:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof GoneException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to redeem coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch redemptions
   */
  async fetchRedemptions(
    organizationId,
    whereOptions: FindOptionsWhere<Redemption> = {},
    skip: number = 0,
    take: number = 10,
    sortBy?: string,
    sortOrder?: sortOrderEnum,
    from?: string,
    to?: string,
  ) {
    this.logger.info('START: fetchRedemptions service');

    try {
      let emailFilter: string = '';

      /**
       * Customer email filter
       */
      if (whereOptions.customer) {
        emailFilter = whereOptions.customer?.valueOf()['email'] as string;
        delete whereOptions.customer;
      }

      /**
       * DATE RANGE FILTER
       */
      let dateFilter: any = undefined;

      if (from && to) {
        dateFilter = Between(new Date(from), new Date(to));
      }

      const [redemptions, count] =
        await this.redemptionsRepository.findAndCount({
          relations: {
            couponCode: true,
            customer: true,
            item: true,
          },
          where: {
            organization: {
              organizationId,
            },
            customer: {
              ...(emailFilter && { email: ILike(`%${emailFilter}%`) }),
            },
            ...(dateFilter && { redemptionDate: dateFilter }),
            ...whereOptions,
          },
          ...(sortBy && { order: { [sortBy]: sortOrder } }),
          select: {
            customer: {
              name: true,
              email: true,
            },
          },
          skip,
          take,
        });

      if (!redemptions || redemptions.length === 0) {
        this.logger.warn('Redemptions not found');
      }

      this.logger.info('END: fetchRedemptions service');

      return this.redemptionWorkbookConverter.convert(
        redemptions,
        organizationId,
        count,
        skip,
        take,
      );
    } catch (error) {
      this.logger.error(`Error in fetchRedemptions:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch redemptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  private validateCouponCode(couponCode: CouponCode) {
    if (
      couponCode.durationType == durationTypeEnum.LIMITED &&
      couponCode.expiresAt < new Date()
    ) {
      this.logger.warn('Coupon code is expired', { code: couponCode.code });
      throw new GoneException('Coupon code is expired');
    }
  }

  private async validateCustomer(
    manager: EntityManager,
    externalCustomerId: string,
    couponCode: CouponCode,
  ) {
    const customer = await manager.findOne(Customer, {
      where: { externalId: externalCustomerId },
    });

    if (!customer) {
      this.logger.warn('Customer not found', { externalCustomerId });
      throw new NotFoundException('Customer not found');
    }

    if (couponCode.customerConstraint == customerConstraintEnum.SPECIFIC) {
      const customerCouponCode = await manager.findOne(CustomerCouponCode, {
        where: {
          customer: {
            customerId: customer.customerId,
          },
          couponCodeId: couponCode.couponCodeId,
        },
      });

      if (!customerCouponCode) {
        this.logger.warn('Customer is not eligible for this coupon');
        throw new ConflictException('Customer is ineligible');
      }
    }

    return customer.customerId;
  }

  private async validateItem(
    manager: EntityManager,
    externalItemId: string,
    coupon: Coupon,
  ) {
    const item = await manager.findOne(Item, {
      where: {
        externalId: externalItemId,
      },
    });

    if (!item) {
      this.logger.warn('Item not found');
      throw new NotFoundException('Item not found');
    }

    if (coupon.itemConstraint === itemConstraintEnum.SPECIFIC) {
      const couponItem = await manager.findOne(CouponItem, {
        where: {
          coupon: {
            couponId: coupon.couponId,
          },
          item: {
            itemId: item.itemId,
          },
        },
      });

      if (!couponItem) {
        this.logger.warn('Item not eligible');
        throw new ConflictException('Item is ineligible');
      }
    }

    return item.itemId;
  }

  private async checkCouponCodeRedemptions(
    manager: EntityManager,
    couponCode: CouponCode,
    customerId: string,
    baseOrderValue: number,
  ) {
    const updatedCouponCode = await manager.findOne(CouponCode, {
      relations: { coupon: true, campaign: true },
      where: { couponCodeId: couponCode.couponCodeId },
    });

    if (
      updatedCouponCode?.minimumAmount &&
      baseOrderValue < updatedCouponCode.minimumAmount
    ) {
      this.logger.warn(
        `Coupon code eligible for amount greater than ${updatedCouponCode?.minimumAmount}`,
      );
      throw new BadRequestException(
        `Coupon code eligible for amount greater than ${updatedCouponCode?.minimumAmount}`,
      );
    }

    if (
      updatedCouponCode?.maxRedemptions &&
      updatedCouponCode.maxRedemptions < updatedCouponCode.redemptionCount
    ) {
      this.logger.warn('Coupon code is fully redeemed', {
        code: updatedCouponCode.code,
      });
      throw new ConflictException(
        'Coupon code is fully redeemed',
        updatedCouponCode.couponCodeId,
      );
    }

    if (updatedCouponCode?.maxRedemptionPerCustomer) {
      const customerRedemptions = await manager.find(Redemption, {
        where: {
          couponCode: {
            couponCodeId: couponCode.couponCodeId,
          },
          customer: {
            customerId,
          },
        },
      });

      if (
        customerRedemptions.length >= updatedCouponCode.maxRedemptionPerCustomer
      ) {
        this.logger.warn('Customer has already redeemed this coupon code');
        throw new ConflictException(
          'Customer has already redeemed this coupon code',
        );
      }
    }
  }

  private async validateCampaignBudget(
    manager: EntityManager,
    campaign: Campaign,
  ) {
    const campaign_summary = await manager.findOne(CampaignSummaryMv, {
      where: {
        campaignId: campaign.campaignId,
      },
    });

    if (
      campaign.budget &&
      campaign_summary!.totalRedemptionAmount > campaign.budget
    ) {
      this.logger.warn('Campaign budget exceeded', {
        campaignId: campaign.campaignId,
      });
      throw new ConflictException('Campaign budget exceeded');
    }
  }

  private async saveRedemption(
    manager: EntityManager,
    couponCode: CouponCode,
    organizationId: string,
    customerId: string,
    itemId: string,
    baseOrderValue: number,
    discount: number,
    externalId?: string,
  ) {
    const redemptionEntity = manager.create(Redemption, {
      organization: {
        organizationId,
      },
      coupon: {
        couponId: couponCode.coupon.couponId,
      },
      campaign: {
        campaignId: couponCode.campaign.campaignId,
      },
      couponCode: {
        couponCodeId: couponCode.couponCodeId,
      },
      baseOrderValue,
      discount,
      externalId: externalId,
      customer: {
        customerId,
      },
      item: {
        itemId,
      },
    });

    return manager.save(Redemption, redemptionEntity);
  }

  async streamRedemptionReport(
    organizationId: string,
    from?: string,
    to?: string,
  ): Promise<PassThrough> {
    if (!from || !to) {
      throw new BadRequestException('Time period not configured for report');
    }
    const passThrough = new PassThrough();

    const csvStream = csvFormat({
      headers: true,
      quoteColumns: true,
    });

    csvStream.pipe(passThrough);

    const dbStream = await this.redemptionsRepository
      .createQueryBuilder('r')
      .leftJoin('r.couponCode', 'cc')
      .leftJoin('r.item', 'i')
      .leftJoin('r.customer', 'c')
      .leftJoin('r.campaign', 'ca')
      .leftJoin('r.coupon', 'co')
      .where('r.organization_id = :organizationId', { organizationId })
      .andWhere('r.redemption_date BETWEEN :start AND :end', {
        start: from,
        end: to,
      })
      .select([
        'r.redemption_id AS redemption_id',
        'r.redemption_date AS redemption_date',
        'c.name AS customer_name',
        'c.email AS customer_email',
        'c.customer_id AS customer_id',
        'i.name AS item_name',
        'i.item_id AS item_id',
        'cc.code AS coupon_code',
        'co.name AS coupon_name',
        'ca.name AS campaign_name',
        'r.base_order_value AS gross_sales',
        'r.discount AS discount',
        '(r.base_order_value - r.discount) AS net_sales',
        'r.external_id AS redemption_external_id',
      ])
      .orderBy('r.redemption_date', 'ASC')
      .stream();

    dbStream.on('data', (row: any) => {
      csvStream.write({
        Date: formatDateReport(row.redemption_date),
        CustomerName: row.customer_name,
        CustomerEmail: row.customer_email,
        Item: row.item_name,
        Coupon: row.coupon_name,
        Campaign: row.campaign_name,
        CouponCode: row.coupon_code,
        GrossSales: row.gross_sales,
        Discount: row.discount,
        NetSales: row.net_sales,
        CustomerID: row.customer_id,
        ItemID: row.item_id,
        RedemptionExternalID: row.redemption_external_id,
      });
    });

    dbStream.on('end', () => {
      csvStream.end();
    });

    dbStream.on('error', (err) => {
      csvStream.end();
      passThrough.destroy(err);
    });

    return passThrough;
  }

}