import { Injectable } from '@nestjs/common';
import { PaginatedListConverter } from './paginated-list.converter';
import { Coupon } from '../entities/coupon.entity';
import { CouponDto } from '../dtos';
import { CouponConverter } from './coupon.converter';

@Injectable()
export class CouponListConverter extends PaginatedListConverter<
  Coupon,
  CouponDto
> {
  constructor() {
    const couponConverter = new CouponConverter();
    super(couponConverter);
  }
}
