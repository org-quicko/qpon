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

@Module({
  imports: [TypeOrmModule.forFeature([CouponItem, Item])],
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
