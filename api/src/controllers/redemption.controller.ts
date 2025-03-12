import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RedemptionsService } from '../services/redemption.service';
import {} from '../dtos';
import { LoggerService } from '../services/logger.service';
import { CreateRedemptionDto } from '../dtos/redemption.dto';

@ApiTags('Redemptions')
@Controller('organizations/:organization_id')
export class RedemptionsController {
  constructor(
    private readonly redemptionsService: RedemptionsService,
    private logger: LoggerService,
  ) {}

  /**
   * Redeem coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupon-codes/redeem')
  async redeemCouponCode(
    @Param('organization_id') organizationId: string,
    @Body() body: CreateRedemptionDto,
  ) {
    this.logger.info('START: redeemCouponCode controller');

    await this.redemptionsService.redeemCouponCode(organizationId, body);

    this.logger.info('END: redeemCouponCode controller');
    return { message: 'Successfully redemmed coupon code' };
  }

  /**
   * Fetch redemptions
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('redemptions')
  async fetchRedemptions(
    @Param('organization_id') organizationId: string,
    @Query('coupon_id') couponId?: string,
    @Query('campaign_id') campaignId?: string,
    @Query('coupon_code_id') couponCodeId?: string,
    @Query('from') from?: number,
    @Query('to') to?: number,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchRedemptions controller');

    const result = await this.redemptionsService.fetchRedemptions(
      organizationId,
      from,
      to,
      {
        coupon: {
          couponId,
        },
        campaign: {
          campaignId,
        },
        couponCode: {
          couponCodeId,
        },
      },
      skip,
      take,
    );

    this.logger.info('END: fetchRedemptions controller');
    return { message: 'Successfully fetched redemptions', result };
  }
}
