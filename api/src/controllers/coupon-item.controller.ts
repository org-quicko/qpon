import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../services/logger.service';
import { CouponItemService } from '../services/coupon-item.service';
import { CreateCouponItemDto, UpdateCouponItemDto } from '../dtos';
import { Permissions } from '../decorators/permission.decorator';
import { CouponItem } from '../entities/coupon-item.entity';

@ApiTags('Coupon')
@Controller('/organizations/:organization_id/coupons/:coupon_id/items')
export class CouponItemController {
  constructor(
    private readonly couponItemService: CouponItemService,
    private logger: LoggerService,
  ) {}

  /**
   * Add items to coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('create', CouponItem)
  @Post()
  async addItems(
    @Param('coupon_id') couponId: string,
    @Body() body: CreateCouponItemDto,
  ) {
    this.logger.info('START: addItemsToCoupon constroller');

    const result = await this.couponItemService.addItems(couponId, body);

    this.logger.info('END: addItemsToCoupon controller');
    return { message: 'Successfully added items to coupon', result };
  }

  /**
   * Fetch items for a coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', CouponItem)
  @Get()
  async fetchItems(
    @Param('coupon_id') couponId: string,
    @Query('name') name?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchItemOfCoupon controller');

    const result = await this.couponItemService.fetchItems(
      couponId,
      skip,
      take,
      {
        name,
      },
    );

    this.logger.info('END: fetchItemOfCoupon controller');
    return { message: 'Successfully fetched items for coupon', result };
  }

  /**
   * Update items in coupon item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', CouponItem)
  @Patch()
  async updateItems(
    @Param('coupon_id') couponId: string,
    @Body() body: UpdateCouponItemDto,
  ) {
    this.logger.info('START: updateItems controller');

    const result = await this.couponItemService.updateItems(couponId, body);

    this.logger.info('END: updateItems controller');
    return { message: 'Successfully updated items for coupon', result };
  }

  /**
   * Remove an item from coupon
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', CouponItem)
  @Delete(':item_id')
  async removeItem(
    @Param('coupon_id') couponId: string,
    @Param('item_id') itemId: string,
  ) {
    this.logger.info('START: removeItem controller');

    const result = await this.couponItemService.removeItem(couponId, itemId);

    this.logger.info('END: removeItem controller');
    return { message: 'Successfully removed item from coupon', result };
  }
}
