import { Injectable } from '@nestjs/common';
import { CouponItemDto, ItemDto } from '../dtos';
import { CouponItem } from '../entities/coupon-item.entity';
import { ItemConverter } from './item.converter';
import { PaginatedList } from 'src/dtos/paginated-list.dto';

@Injectable()
export class CouponItemConverter {
  constructor(private itemConverter: ItemConverter) {}

  convert(
    couponItems: CouponItem[],
    skip?: number,
    take?: number,
    count?: number,
  ): PaginatedList<ItemDto> {
    const couponItemDto = new CouponItemDto();

    couponItemDto.item = couponItems.map((couponItem) =>
      this.itemConverter.convert(couponItem.item),
    );

    const itemList = PaginatedList.Builder.build(
      couponItemDto.item,
      skip!,
      take!,
      count,
    );

    return itemList;
  }
}
