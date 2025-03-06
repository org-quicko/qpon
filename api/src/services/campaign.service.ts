import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from '../dtos';
import { LoggerService } from './logger.service';
import { CampaignConverter } from '../converters/campaign.converter';
import { campaignStatusEnum, couponCodeStatusEnum } from 'src/enums';
import { CouponCode } from 'src/entities/coupon-code.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private campaignConverter: CampaignConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create campaign
   */
  async createCampaign(couponId: string, body: CreateCampaignDto) {
    this.logger.info('START: createCampaign service');
    try {
      const campaignEntity = this.campaignRepository.create({
        name: body.name,
        budget: body.budget,
        externalId: body.externalId,
        coupon: {
          couponId,
        },
      });

      const savedCampaign = await this.campaignRepository.save(campaignEntity);

      this.logger.info('END: createCampaign service');
      return this.campaignConverter.convert(savedCampaign);
    } catch (error) {
      this.logger.error(`Error in createCampaign: ${error.message}`, error);

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
        throw new NotFoundException('Campaigns not found for this coupon');
      }

      this.logger.info('END: fetchCampaigns service');
      return campaigns.map((campaign) =>
        this.campaignConverter.convert(campaign),
      );
    } catch (error) {
      this.logger.error(`Error in fetchCampaigns: ${error.message}`, error);

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
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
      }

      this.logger.info('END: fetchCampaign service');
      return this.campaignConverter.convert(campaign);
    } catch (error) {
      this.logger.error(`Error in fetchCampaign: ${error.message}`, error);

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
        },
      });

      if (!campaign) {
        this.logger.warn('Campaign not found', campaignId);
        throw new NotFoundException('Campaign not found');
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
      this.logger.error(`Error in updateCampaign: ${error.message}`, error);

      if (error instanceof NotFoundException) {
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
          where: { campaignId },
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
          `Error in deactivateCampaign: ${error.message}`,
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
      this.logger.error(`Error in reactivateCampaign: ${error.message}`, error);

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
   * Fetch campaign summary
   */
  async fetchCampaignSummary(
    campaignId?: string,
    take?: number,
    skip?: number,
  ) {
    throw new Error('Method not implemented.');
  }
}
