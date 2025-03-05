import { Injectable } from '@nestjs/common';
import { CouponItemDto } from '../dtos';
import { CouponItem } from '../entities/coupon-item.entity';
import { ItemConverter } from './item.converter';

@Injectable()
export class CouponItemConverter {
  constructor(private itemConverter: ItemConverter) {}

  convert(couponItems: CouponItem[]): CouponItemDto {
    const couponItemDto = new CouponItemDto();

    couponItemDto.item = couponItems.map((couponItem) =>
      this.itemConverter.convert(couponItem.item),
    );

    return couponItemDto;
  }
}
