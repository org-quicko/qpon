import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CouponCodeService } from '../services/coupon-code.service';
import { CouponCodeDto } from '../dtos';

@ApiTags('Coupon Code')
@Controller('')
export class CouponCodeController {
  constructor(private readonly couponCodeService: CouponCodeService) {}

  /**
   * Create coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes')
  async createCouponCode(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Body() body: CouponCodeDto,
  ) {
    return this.couponCodeService.createCouponCode(couponId, campaignId, body);
  }

  /**
   * Fetch coupon codes
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes')
  async fetchCouponCodes(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Query('status') status?: string,
    @Query('visibility') visibility?: string,
    @Query('external_id') externalId?: string,
    @Query('duration_type') durationType?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.couponCodeService.fetchCouponCodes(
      couponId,
      campaignId,
      status,
      visibility,
      externalId,
      durationType,
      take,
      skip,
    );
  }

  /**
   * Fetch coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id')
  async fetchCouponCode(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    return this.couponCodeService.fetchCouponCode(
      couponId,
      campaignId,
      couponCodeId,
    );
  }

  /**
   * Update coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id',
  )
  async updateCouponCode(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
    @Body() body: any,
  ) {
    return this.couponCodeService.updateCouponCode(
      couponId,
      campaignId,
      couponCodeId,
      body,
    );
  }

  /**
   * Fetch coupon codes by code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupon-codes')
  async fetchCouponCodesByCode(
    @Query('code') code?: string,
    @Query('status') status?: string,
    @Query('customer_id') customerId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.couponCodeService.fetchCouponCodesByCode(
      code,
      status,
      customerId,
      take,
      skip,
    );
  }

  /**
   * Deactivate coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/deactivate',
  )
  async deactivateCouponCode(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    return this.couponCodeService.deactivateCouponCode(
      couponId,
      campaignId,
      couponCodeId,
    );
  }

  /**
   * Reactivate coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/reactivate',
  )
  async reactivateCouponCode(
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    return this.couponCodeService.reactivateCouponCode(
      couponId,
      campaignId,
      couponCodeId,
    );
  }
}
