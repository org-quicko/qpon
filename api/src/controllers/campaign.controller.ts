import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CampaignService } from '../services/campaign.service';
import { CampaignDto } from '../dtos';

@ApiTags('Campaign')
@Controller('')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  /**
   * Create campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupons/:coupon_id/campaigns')
  async createCampaign(
    @Param('coupon_id') couponId: string,
    @Body() body: CampaignDto,
  ) {
    return this.campaignService.createCampaign(couponId, body);
  }

  /**
   * Fetch campaigns
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns')
  async fetchCampaigns(
    @Param('coupon_id') couponId: string,
    @Query('status') status?: string,
    @Query('budgeted') budgeted?: boolean,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.campaignService.fetchCampaigns(
      couponId,
      status,
      budgeted,
      take,
      skip,
    );
  }

  /**
   * Fetch campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns/:campaign_id')
  async fetchCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    return this.campaignService.fetchCampaign(couponId, campaignId);
  }

  /**
   * Update campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch('coupons/:coupon_id/campaigns/:campaign_id')
  async updateCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Body() body: any,
  ) {
    return this.campaignService.updateCampaign(couponId, campaignId, body);
  }

  /**
   * Delete campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete('coupons/:coupon_id/campaigns/:campaign_id')
  async deleteCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    return this.campaignService.deleteCampaign(couponId, campaignId);
  }

  /**
   * Deactivate campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupons/:coupon_id/campaigns/:campaign_id/deactivate')
  async deactivateCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    return this.campaignService.deactivateCampaign(couponId, campaignId);
  }

  /**
   * Reactivate campaign
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupons/:coupon_id/campaigns/:campaign_id/reactivate')
  async reactivateCampaign(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
  ) {
    return this.campaignService.reactivateCampaign(couponId, campaignId);
  }

  /**
   * Fetch campaign summary
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('campaigns/summary')
  async fetchCampaignSummary(
    @Query('campaign_id') campaignId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.campaignService.fetchCampaignSummary(campaignId, take, skip);
  }
}
