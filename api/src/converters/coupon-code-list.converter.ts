import { Injectable } from '@nestjs/common';
import { PaginatedListConverter } from './paginated-list.converter';
import { CouponCodeDto } from '../dtos';
import { CouponCodeConverter } from './coupon-code.converter';
import { CouponCode } from '../entities/coupon-code.entity';

@Injectable()
export class CouponCodeListConverter extends PaginatedListConverter<
  CouponCode,
  CouponCodeDto
> {
  constructor() {
    const couponCodeConverter = new CouponCodeConverter();
    super(couponCodeConverter);
  }
}
