import { Controller, Get, Post, Body, Query, Param, Res } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Between } from 'typeorm';
import { Response } from 'express';
import { RedemptionsService } from '../services/redemption.service';
import {} from '../dtos';
import { LoggerService } from '../services/logger.service';
import { CreateRedemptionDto } from '../dtos/redemption.dto';
import { getStartEndDate } from '../utils/date.utils';
import { timePeriodEnum } from '../enums';
import { getReportFileName } from '../utils/reportFileName.util';
import { SkipTransform } from '../decorators/skipTransform.decorator';

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
   * Generate redemption report
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @SkipTransform()
  @Get('redemptions/reports')
  async generateRedemptionReport(
    @Res() res: Response,
    @Param('organization_id') organizationId: string,
    @Query('coupon_id') couponId?: string,
    @Query('campaign_id') campaignId?: string,
    @Query('coupon_code_id') couponCodeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('time_period') timePeriod?: timePeriodEnum,
  ) {
    this.logger.info('START: fetchRedemptions controller');

    const buffer = await this.redemptionsService.generateRedemptionsReport(
      organizationId,
      from,
      to,
      timePeriod,
    );

    const fileName = getReportFileName('Redemption');

    this.logger.info('END: fetchRedemptions controller');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
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
    @Query('customer_email') customerEmail?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchRedemptions controller');

    let dateFilter = {};
    if (from && to) {
      const { parsedStartDate, parsedEndDate } = getStartEndDate(from, to);
      dateFilter = { createdAt: Between(parsedStartDate, parsedEndDate) };
    }

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
        ...dateFilter,
      },
      skip,
      take,
    );

    this.logger.info('END: fetchRedemptions controller');
    return { message: 'Successfully fetched redemptions', result };
  }
}
