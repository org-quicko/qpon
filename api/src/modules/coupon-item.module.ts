import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponItemController } from '../controllers/coupon-item.controller';
import { CouponItemConverter } from '../converters/coupon-item.converter';
import { CouponItem } from '../entities/coupon-item.entity';
import { Item } from '../entities/item.entity';
import { CouponItemService } from '../services/coupon-item.service';
import { ItemsService } from '../services/item.service';
import { ItemConverter } from 'src/converters/item.converter';
import { ItemsListConverter } from 'src/converters/items-list.converter';
import { Coupon } from 'src/entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponItem, Item, Coupon])],
  controllers: [CouponItemController],
  providers: [
    CouponItemService,
    CouponItemConverter,
    ItemsService,
    ItemConverter,
    ItemsListConverter,
  ],
  exports: [CouponItemService],
})
export class CouponItemModule {}
