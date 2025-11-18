import { Controller, Get, Post, Body, Query, Param, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RedemptionsService } from '../services/redemption.service';
import { LoggerService } from '../services/logger.service';
import { CreateRedemptionDto } from '../dtos/redemption.dto';
import { sortOrderEnum } from '../enums';
import { SkipTransform } from '../decorators/skipTransform.decorator';
import { Permissions } from 'src/decorators/permission.decorator';
import { Redemption } from 'src/entities/redemption.entity';

@ApiTags('Redemptions')
@Controller('organizations/:organization_id')
export class RedemptionsController {
  constructor(
    private readonly redemptionsService: RedemptionsService,
    private logger: LoggerService,
  ) { }

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
   * Generate redemption report
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @SkipTransform()
  @Permissions('read', Redemption)
  @Get('redemptions/reports')
  async generateRedemptionReport(
    @Param('organization_id') organizationId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<StreamableFile> {
    this.logger.info('START: generateRedemptionReport controller');

    const stream = await this.redemptionsService.streamRedemptionReport(
      organizationId,
      from,
      to,
    );
    this.logger.info('END: generateRedemptionReport controller');

    return new StreamableFile(stream, {
      type: 'text/csv',
      disposition: 'attachment; filename=redemption_report.csv',
    });
  }

  /**
   * Fetch redemptions for a coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Redemption)
  @Get(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/redemptions',
  )
  async fetchRedemptionsForCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
    @Query('customer_email') customerEmail?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: sortOrderEnum,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchRedemptionsForCouponCode controller');

    const result = await this.redemptionsService.fetchRedemptions(
      organizationId,
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
        customer: {
          email: customerEmail,
        },
      },
      skip,
      take,
      sortBy,
      sortOrder,
    );

    this.logger.info('END: fetchRedemptionsForCouponCode controller');
    return { message: 'Successfully fetched redemptions', result };
  }

  /**
   * Fetch redemptions
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Redemption)
  @Get('redemptions')
  async fetchRedemptions(
    @Param('organization_id') organizationId: string,
    @Query('coupon_id') couponId?: string,
    @Query('campaign_id') campaignId?: string,
    @Query('coupon_code_id') couponCodeId?: string,
    @Query('customer_email') customerEmail?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: sortOrderEnum,
  ) {
    this.logger.info('START: fetchRedemptions controller');
    const result = await this.redemptionsService.fetchRedemptions(
      organizationId,
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
        customer: {
          email: customerEmail,
        },
      },
      skip,
      take,
      sortBy,
      sortOrder,
      from,
      to,
    );

    this.logger.info('END: fetchRedemptions controller');
    return { message: 'Successfully fetched redemptions', result };
  }
}
