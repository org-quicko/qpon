import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import { campaignStatusEnum, sortOrderEnum, statusEnum } from 'src/enums';
import { Permissions } from '../decorators/permission.decorator';
import { Campaign } from '../entities/campaign.entity';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';
import { Not } from 'typeorm';

@ApiTags('Campaign')
@Controller('organizations/:organization_id/coupons/:coupon_id/campaigns')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private logger: LoggerService,
  ) {}

  /**
   * Create campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('create', Campaign)
  @Post()
  async createCampaign(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Body() body: CreateCampaignDto,
  ) {
    this.logger.info('START: createCampaign controller');

    const result = await this.campaignService.createCampaign(
      organizationId,
      couponId,
      body,
    );

    this.logger.info('END: createCampaign controller');
    return { message: 'Successfully created campaign', result };
  }

  /**
   * Fetch campaigns
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Campaign)
  @Get()
  async fetchCampaigns(
    @Param('coupon_id') couponId: string,
    @Query('status') status?: campaignStatusEnum,
    @Query('budgeted') budgeted?: boolean,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchCampaigns controller');

    const result = await this.campaignService.fetchCampaigns(
      couponId,
      status,
      budgeted,
      take,
      skip,
    );

    this.logger.info('END: fetchCampaigns controller');
    return { message: 'Successfully fetched campaigns', result };
  }

  /**
   * Fetch summary of a campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', CampaignSummaryMv)
  @Get(':campaign_id/summary')
  async fetchCampaignSummary(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    this.logger.info('START: fetchCampaignSummary controller');

    const result = await this.campaignService.fetchCampaignSummary(
      couponId,
      campaignId,
    );

    this.logger.info('END: fetchCampaignSummary controller');
    return { message: 'Successfully fetched campaign summary', result };
  }

  /**
   * Fetch summary of all campaigns
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', CampaignSummaryMv)
  @Get('summary')
  async fetchCampaignsSummary(
    @Param('coupon_id') couponId: string,
    @Query('name') name?: string,
    @Query('status') status?: statusEnum,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: sortOrderEnum,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchCampaignsSummary controller');

    const result = await this.campaignService.fetchCampaignsSummary(
      couponId,
      { status: Not(campaignStatusEnum.ARCHIVE), name },
      sortBy,
      sortOrder,
      skip,
      take,
    );

    this.logger.info('END: fetchCampaignsSummary controller');
    return { message: 'Successfully fetched all campaign summaries', result };
  }

  /**
   * Fetch campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Campaign)
  @Get(':campaign_id')
  async fetchCampaign(@Param('campaign_id') campaignId: string) {
    this.logger.info('START: fetchCampaign controller');

    const result = await this.campaignService.fetchCampaign(campaignId);

    this.logger.info('END: fetchCampaign controller');
    return { message: 'Successfully fetched a campaign', result };
  }

  /**
   * Update campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Campaign)
  @Patch(':campaign_id')
  async updateCampaign(
    @Param('campaign_id') campaignId: string,
    @Body() body: UpdateCampaignDto,
  ) {
    this.logger.info('START: updateCampaign controller');

    const result = await this.campaignService.updateCampaign(campaignId, body);

    this.logger.info('END: updateCampaign controller');
    return { message: 'Successfully updated campaign', result };
  }

  /**
   * Deactivate campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Campaign)
  @Post(':campaign_id/deactivate')
  async deactivateCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    this.logger.info('START: deactivateCampaign controller');

    await this.campaignService.deactivateCampaign(campaignId);

    this.logger.info('END: deactivateCampaign controller');
    return { message: 'Successfully deactivated the campaign' };
  }

  /**
   * Reactivate campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Campaign)
  @Post(':campaign_id/reactivate')
  async reactivateCampaign(@Param('campaign_id') campaignId: string) {
    this.logger.info('START: reactivateCampaign controller');

    await this.campaignService.reactivateCampaign(campaignId);

    this.logger.info('END: reactivateCampaign controller');
    return { message: 'Successfully reactivated campaign' };
  }

  /**
   * Delete campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', Campaign)
  @Delete(':campaign_id')
  async deleteCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    this.logger.info('START: deleteCampaign controller');

    await this.campaignService.deleteCampaign(couponId, campaignId);

    this.logger.info('END: deleteCampaign controller');
    return { message: 'Successfully deleted campaign' };
  }
}
