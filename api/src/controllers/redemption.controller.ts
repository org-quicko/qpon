import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RedemptionsService } from '../services/redemption.service';
import {} from '../dtos';

@ApiTags('Redemptions')
@Controller('')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  /**
   * Redeem coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupon-codes/redeem')
  async redeemCouponCode(@Body() body: any) {
    return this.redemptionsService.redeemCouponCode(body);
  }

  /**
   * Fetch redemptions
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('redemptions')
  async fetchRedemptions(
    @Query('coupon_id') couponId?: string,
    @Query('campaign_id') campaignId?: string,
    @Query('coupon_code_id') couponCodeId?: string,
    @Query('from') from?: number,
    @Query('to') to?: number,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.redemptionsService.fetchRedemptions(
      couponId,
      campaignId,
      couponCodeId,
      from,
      to,
      skip,
      take,
    );
  }
}
