import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from '../dtos';
import { LoggerService } from './logger.service';
import { CampaignConverter } from '../converters/campaign.converter';
import {
  campaignStatusEnum,
  couponCodeStatusEnum,
  sortOrderEnum,
} from 'src/enums';
import { CouponCode } from 'src/entities/coupon-code.entity';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';
import { CampaignSummarySheetConverter } from '../converters/campaign-summary-sheet.converter';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignSummaryMv)
    private readonly campaignSummaryMvRepository: Repository<CampaignSummaryMv>,
    private campaignConverter: CampaignConverter,
    private campaignSummarySheetConverter: CampaignSummarySheetConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create campaign
   */
  async createCampaign(
    organizationId: string,
    couponId: string,
    body: CreateCampaignDto,
  ) {
    this.logger.info('START: createCampaign service');
    try {
      if (body.name) {
        const campaign = await this.campaignRepository
          .createQueryBuilder('campaign')
          .where(
            `LOWER(campaign.name) = LOWER(:name) AND status != 'archive' AND coupon_id = :coupon_id`,
            {
              name: body.name,
              coupon_id: couponId,
            },
          )
          .getOne();

        if (campaign) {
          this.logger.warn('Campaign with same name exists');
          throw new ConflictException('Campaign with same name exists');
        }
      }

      const campaignEntity = this.campaignRepository.create({
        name: body.name,
        budget: body.budget,
        externalId: body.externalId,
        coupon: {
          couponId,
        },
        organization: {
          organizationId,
        },
      });

      const savedCampaign = await this.campaignRepository.save(campaignEntity);

      this.logger.info('END: createCampaign service');
      return this.campaignConverter.convert(savedCampaign);
    } catch (error) {
      this.logger.error(`Error in createCampaign:`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch campaigns
   */
  async fetchCampaigns(
    couponId: string,
    status?: campaignStatusEnum,
    budgeted?: boolean,
    skip: number = 0,
    take: number = 10,
  ) {
    this.logger.info('START: fetchCampaigns service');
    try {
      const whereOptions: FindOptionsWhere<Campaign> = {};
      if (budgeted) {
        whereOptions.budget = MoreThan(0);
      }

      if (status) {
        whereOptions.status = status;
      } else {
        whereOptions.status = Not(campaignStatusEnum.ARCHIVE);
      }

      const campaigns = await this.campaignRepository.find({
        relations: {
          coupon: true,
        },
        where: {
          coupon: {
            couponId,
          },
          ...whereOptions,
        },
        skip,
        take,
      });

      if (!campaigns || campaigns.length == 0) {
        this.logger.warn('No campaigns found for the given coupon', couponId);
      }

      this.logger.info('END: fetchCampaigns service');
      return campaigns.map((campaign) =>
        this.campaignConverter.convert(campaign),
      );
    } catch (error) {
      this.logger.error(`Error in fetchCampaigns:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch campaign
   */
  async fetchCampaign(campaignId: string) {
    this.logger.info('START: fetchCampaign service');
    try {
      const campaign = await this.campaignRepository.findOne({
        where: {
          campaignId,
          status: Not(campaignStatusEnum.ARCHIVE),
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
      }

      this.logger.info('END: fetchCampaign service');
      return this.campaignConverter.convert(campaign);
    } catch (error) {
      this.logger.error(`Error in fetchCampaign:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch campaign for validation
   */
  async fetchCampaignForValidation(campaignId: string) {
    this.logger.info('START: fetchCampaignForValidation service');
    try {
      const campaign = await this.campaignRepository.findOne({
        relations: {
          organization: true,
        },
        where: {
          campaignId,
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
      }

      this.logger.info('END: fetchCampaignForValidation service');
      return campaign;
    } catch (error) {
      this.logger.error(
        `Error in fetchCampaignForValidation:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, body: UpdateCampaignDto) {
    this.logger.info('START: updateCampaign service');
    try {
      const campaign = await this.campaignRepository.findOne({
        where: {
          campaignId,
          status: Not(campaignStatusEnum.ARCHIVE),
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
      }

      if (body.name) {
        const campaign = await this.campaignRepository
          .createQueryBuilder('campaign')
          .where(
            `LOWER(campaign.name) = LOWER(:name) AND status != 'archive'`,
            {
              name: body.name,
            },
          )
          .getOne();

        if (campaign) {
          this.logger.warn('Campaign with same name exists');
          throw new ConflictException('Campaign with same name exists');
        }
      }

      await this.campaignRepository.update(campaignId, body);

      const updatedCampaign = await this.campaignRepository.findOne({
        where: {
          campaignId,
        },
      });

      this.logger.info('END: updateCampaign service');
      return this.campaignConverter.convert(updatedCampaign!);
    } catch (error) {
      this.logger.error(`Error in updateCampaign:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to update campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deactivate campaign
   */
  async deactivateCampaign(campaignId: string) {
    this.logger.info('START: deactivateCampaign service');
    return this.datasource.transaction(async (manager) => {
      try {
        const campaign = await manager.findOne(Campaign, {
          where: { campaignId, status: Not(campaignStatusEnum.ARCHIVE) },
        });

        if (!campaign) {
          this.logger.warn('Campaign not found', campaignId);
          throw new NotFoundException('Campaign not found');
        }

        await manager.update(
          CouponCode,
          { campaign: { campaignId } },
          { status: couponCodeStatusEnum.INACTIVE },
        );

        await manager.update(Campaign, campaignId, {
          status: campaignStatusEnum.INACTIVE,
        });

        this.logger.info('END: deactivateCampaign service');
      } catch (error) {
        this.logger.error(
          `Error in deactivateCampaign:`,
          error,
        );

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to deactivate campaign',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  /**
   * Reactivate campaign
   */
  async reactivateCampaign(campaignId: string) {
    this.logger.info('START: reactivateCampaign service');
    try {
      const campaign = await this.campaignRepository.findOne({
        where: {
          campaignId,
          status: Not(campaignStatusEnum.ARCHIVE),
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
      }

      await this.campaignRepository.update(campaignId, {
        status: campaignStatusEnum.ACTIVE,
      });

      this.logger.info('END: reactivateCampaign service');
    } catch (error) {
      this.logger.error(`Error in reactivateCampaign:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to reactivate campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch campaign summaries for a coupon
   */
  async fetchCampaignsSummary(
    couponId: string,
    whereOptions: FindOptionsWhere<CampaignSummaryMv> = {},
    sortBy?: string,
    sortOrder?: sortOrderEnum,
    skip: number = 0,
    take: number = 10,
  ) {
    this.logger.info('START: fetchCampaignsSummary service');
    try {
      let nameFilter: string = '';

      if (whereOptions.name) {
        nameFilter = whereOptions.name as string;
        delete whereOptions.name;
      }

      const [campaignSummaryMv, count] =
        await this.campaignSummaryMvRepository.findAndCount({
          where: {
            couponId,
            ...whereOptions,
            ...(nameFilter && { name: ILike(`%${nameFilter}%`) }),
          },
          ...(sortBy && { order: { [sortBy]: sortOrder } }),
          skip,
          take,
        });

      if (!campaignSummaryMv || campaignSummaryMv.length == 0) {
        this.logger.warn('Unable to find campaign summaries');
      }

      this.logger.info('END: fetchCampaignsSummary service');
      return this.campaignSummarySheetConverter.convert(
        campaignSummaryMv,
        couponId,
        count,
        skip,
        take,
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchCampaignSummary:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch campaign summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch campaign summary
   */
  async fetchCampaignSummary(couponId: string, campaignId: string) {
    this.logger.info('START: fetchCampaignSummary service');
    try {
      const campaignSummaryMv = await this.campaignSummaryMvRepository.find({
        where: {
          couponId,
          campaignId,
          status: Not(campaignStatusEnum.ARCHIVE),
        },
      });

      if (!campaignSummaryMv || campaignSummaryMv.length == 0) {
        this.logger.warn('Unable to find campaign summary');
        throw new NotFoundException('Unable to find campaign summary');
      }

      this.logger.info('END: fetchCampaignSummary service');
      return this.campaignSummarySheetConverter.convert(campaignSummaryMv, couponId);
    } catch (error) {
      this.logger.error(
        `Error in fetchCampaignSummary:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch campaign summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(couponId: string, campaignId: string) {
    this.logger.info('STAART: deleteCampaign service');
    return this.datasource.transaction(async (manager) => {
      try {
        // mark all the coupon codes archive
        await manager.update(
          CouponCode,
          {
            coupon: { couponId },
            campaign: { campaignId },
          },
          { status: couponCodeStatusEnum.ARCHIVE },
        );

        //mark the campaign archive
        await manager.update(
          Campaign,
          {
            campaignId,
          },
          { status: campaignStatusEnum.ARCHIVE },
        );
      } catch (error) {
        this.logger.error(`Error in deleteCampaign:`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to delete campaign',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
}
