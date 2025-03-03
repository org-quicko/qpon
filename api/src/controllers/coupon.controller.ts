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
import { CouponDto } from '../dtos';

@ApiTags('Coupon')
@Controller('/organizations/:organization_id/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * Create coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createCoupon(
    @Param('organization_id') organizationId: string,
    @Body() body: CouponDto,
  ) {
    return this.couponService.createCoupon(organizationId, body);
  }

  /**
   * Fetch coupons
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchCoupons(
    @Param('organization_id') organizationId: string,
    @Query('status') status?: string,
    @Query('discount_type') discountType?: string,
    @Query('external_item_id') externalItemId?: string,
    @Query('name') name?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.couponService.fetchCoupons(
      organizationId,
      status,
      discountType,
      externalItemId,
      name,
      take,
      skip,
    );
  }

  /**
   * Fetch coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get(':coupon_id')
  async fetchCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
  ) {
    return this.couponService.fetchCoupon(organizationId, couponId);
  }

  /**
   * Update coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(':coupon_id')
  async updateCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
    @Body() body: any,
  ) {
    return this.couponService.updateCoupon(organizationId, couponId, body);
  }

  /**
   * Delete coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete(':coupon_id')
  async deleteCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
  ) {
    return this.couponService.deleteCoupon(organizationId, couponId);
  }

  /**
   * Deactivate coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(':coupon_id/deactivate')
  async deactivateCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
  ) {
    return this.couponService.deactivateCoupon(organizationId, couponId);
  }

  /**
   * Reactivate coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post(':coupon_id/reactivate')
  async reactivateCoupon(
    @Param('organization_id') organizationId: string,
    @Param('coupon_id') couponId: string,
  ) {
    return this.couponService.reactivateCoupon(organizationId, couponId);
  }

  /**
   * Fetch coupons summary
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get('summary')
  async fetchCouponsSummary(
    @Param('organization_id') organizationId: string,
    @Query('coupon_id') couponId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.couponService.fetchCouponsSummary(
      organizationId,
      couponId,
      take,
      skip,
    );
  }
}
