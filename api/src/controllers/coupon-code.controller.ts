import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CouponCodeService } from '../services/coupon-code.service';
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import {
  couponCodeStatusEnum,
  durationTypeEnum,
  visibilityEnum,
} from 'src/enums';

@ApiTags('Coupon Code')
@Controller('organizations/:organization_id')
export class CouponCodeController {
  constructor(
    private readonly couponCodeService: CouponCodeService,
    private logger: LoggerService,
  ) {}

  /**
   * Create coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes')
  async createCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Body() body: CreateCouponCodeDto,
  ) {
    this.logger.info('START: createCouponCode controller');

    const result = await this.couponCodeService.createCouponCode(
      organizationId,
      couponId,
      campaignId,
      body,
    );

    this.logger.info('END: createCouponCode controller');
    return { message: 'Successfully created coupon code', result };
  }

  /**
   * Fetch coupon codes
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes')
  async fetchCouponCodes(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Query('status') status?: couponCodeStatusEnum,
    @Query('visibility') visibility?: visibilityEnum,
    @Query('external_id') externalId?: string,
    @Query('duration_type') durationType?: durationTypeEnum,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchCouponCodes controller');

    const result = await this.couponCodeService.fetchCouponCodes(
      organizationId,
      couponId,
      campaignId,
      take,
      skip,
      {
        status,
        visibility,
        durationType,
        customerCouponCodes: {
          customer: {
            externalId,
          },
        },
      },
    );

    this.logger.info('END: fetchCouponCodes controller');
    return { message: 'Successfully fetched coupon codes', result };
  }

  /**
   * Fetch coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id')
  async fetchCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    this.logger.info('START: fetchCouponCode controller');

    const result = await this.couponCodeService.fetchCouponCode(
      organizationId,
      couponId,
      campaignId,
      couponCodeId,
    );

    this.logger.info('END: fetchCouponCode controller');
    return { message: 'Successfully fetched coupon code', result };
  }

  /**
   * Update coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id',
  )
  async updateCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
    @Body() body: UpdateCouponCodeDto,
  ) {
    this.logger.info('START: updateCouponCode controller');

    const result = await this.couponCodeService.updateCouponCode(
      organizationId,
      couponId,
      campaignId,
      couponCodeId,
      body,
    );

    this.logger.info('END: updateConponCode controller');
    return { message: 'Successfully updated coupon code', result };
  }

  /**
   * Fetch coupon codes by code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('coupon-codes')
  async fetchCouponCodesByCode(
    @Headers('x-accept-type') acceptType: string,
    @Param('organization_id') organizationId: string,
    @Query('code') code?: string,
    @Query('status') status?: couponCodeStatusEnum,
    @Query('customer_id') customerId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchCouponCodesByCode controller');
    let result;
    if (acceptType == 'application/json;format=sheet-json') {
      result = await this.couponCodeService.fetchCouponCodesByCodeSheet(
        organizationId,
        {
          code,
          status,
          customerCouponCodes: {
            customer: {
              externalId: customerId,
            },
          },
        },
        take,
        skip,
      );
    } else {
      result = await this.couponCodeService.fetchCouponCodesByCode(
        organizationId,
        {
          code,
          status,
          customerCouponCodes: {
            customer: {
              externalId: customerId,
            },
          },
        },
        take,
        skip,
      );
    }

    this.logger.info('END: fetchCouponCodesByCode controller');
    return { message: 'Successfully fetched coupon codes by code', result };
  }

  /**
   * Deactivate coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/deactivate',
  )
  async deactivateCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    this.logger.info('START: deactivateCouponCode controller');

    await this.couponCodeService.deactivateCouponCode(
      organizationId,
      couponId,
      campaignId,
      couponCodeId,
    );

    this.logger.info('END: deactivateCouponCode controller');
    return { message: 'Successfully deactivated the coupon code' };
  }

  /**
   * Reactivate coupon code
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(
    'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/reactivate',
  )
  async reactivateCouponCode(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Param('campaign_id') campaignId: string,
    @Param('coupon_code_id') couponCodeId: string,
  ) {
    this.logger.info('START: reactivateCouponCode controller');

    await this.couponCodeService.reactivateCouponCode(
      organizationId,
      couponId,
      campaignId,
      couponCodeId,
    );

    this.logger.info('END: reactivateCouponCode controller');
    return { message: 'Successfully reactivated the coupon code' };
  }
}
