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
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto, UpdateCouponDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import { discountTypeEnum, statusEnum } from '../enums';
import { Permissions } from '../decorators/permission.decorator';
import { Coupon } from '../entities/coupon.entity';
import { CouponSummaryMv } from '../entities/coupon-summary.view';

@ApiTags('Coupon')
@Controller('/organizations/:organization_id/coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private logger: LoggerService,
  ) {}

  /**
   * Create coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('create', Coupon)
  @Post()
  async createCoupon(
    @Param('organization_id') organizationId: string,
    @Body() body: CreateCouponDto,
  ) {
    this.logger.info('START: createCoupon controller');

    const result = await this.couponService.createCoupon(organizationId, body);

    this.logger.info('END: createCoupon controller');
    return { message: 'Successfully created coupon', result };
  }

  /**
   * Fetch coupons
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Coupon)
  @Get()
  async fetchCoupons(
    @Param('organization_id') organizationId: string,
    @Query('status') status?: statusEnum,
    @Query('discount_type') discountType?: discountTypeEnum,
    @Query('external_item_id') externalItemId?: string,
    @Query('name') name?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchCoupons controller');

    const result = await this.couponService.fetchCoupons(
      organizationId,
      skip,
      take,
      {
        name,
        status,
        discountType,
        couponItems: {
          item: {
            externalId: externalItemId,
          },
        },
      },
    );

    this.logger.info('END: fetchCoupons controller');
    return { message: 'Successfully fetched coupons', result };
  }

  /**
   * Fetch coupons summary
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', CouponSummaryMv)
  @Get('/summary')
  async fetchCouponSummary(
    @Param('organization_id') organizationId: string,
    @Query('coupon_id') couponId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchCouponSummary controller');

    const result = await this.couponService.fetchCouponSummary(
      organizationId,
      { couponId },
      skip,
      take,
    );

    this.logger.info('END: fetchCouponSummary controller');
    return { message: 'Successfully fetched organization summary', result };
  }

  /**
   * Fetch coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Coupon)
  @Get(':coupon_id')
  async fetchCoupon(@Param('coupon_id') couponId: string) {
    this.logger.info('START: fetchCoupon controller');

    const result = await this.couponService.fetchCoupon(couponId);

    this.logger.info('END: fetchCoupon controller');
    return { message: 'Successfully fetched coupon', result };
  }

  /**
   * Update coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Coupon)
  @Patch(':coupon_id')
  async updateCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Body() body: UpdateCouponDto,
  ) {
    this.logger.info('START: updateCoupon controller');

    const result = await this.couponService.updateCoupon(
      organizationId,
      couponId,
      body,
    );

    this.logger.info('END: updateCoupon controller');
    return { message: 'Successfully updated coupon', result };
  }

  /**
   * Delete coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', Coupon)
  @Delete(':coupon_id')
  async deleteCoupon(@Param('coupon_id') couponId: string) {
    this.logger.info('START: deleteCoupon controller');

    const result = await this.couponService.deleteCoupon(couponId);

    this.logger.info('END: deleteCoupon controller');
    return { message: 'Successfully deleted coupon', result };
  }

  /**
   * Deactivate coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Coupon)
  @Post(':coupon_id/deactivate')
  async deactivateCoupon(@Param('coupon_id') couponId: string) {
    this.logger.info('START: deactivateCoupon controller');

    await this.couponService.deactivateCoupon(couponId);

    this.logger.info('END: deactivateCoupon controller');
    return { message: 'Successfully deactivated coupon' };
  }

  /**
   * Reactivate coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Coupon)
  @Post(':coupon_id/reactivate')
  async reactivateCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
  ) {
    this.logger.info('START: reactivateCoupon controller');

    await this.couponService.reactivateCoupon(couponId);

    this.logger.info('END: reactivateCoupon controller');
    return { message: 'Successfully reactivated coupon' };
  }
}
