import { Injectable } from '@nestjs/common';
import { CouponDto } from '../dtos';
import { Coupon } from '../entities/coupon.entity';
import { discountTypeEnum } from '../enums';
@Injectable()
export class CouponConverter {
  convert(coupon: Coupon): CouponDto {
    const couponDto = new CouponDto();

    couponDto.couponId = coupon.couponId;
    couponDto.name = coupon.name;
    couponDto.itemConstraint = coupon.itemConstraint;
    couponDto.discountType = coupon.discountType;

    if (coupon.discountType == discountTypeEnum.FIXED) {
      couponDto.discountValue = coupon.discountValue;
    } else if (
      coupon.discountType == discountTypeEnum.PERCENTAGE &&
      coupon.discountUpto > 0
    ) {
      couponDto.discountUpto = coupon.discountUpto;
    }

    couponDto.status = coupon.status;
    couponDto.createdAt = coupon.createdAt;
    couponDto.updatedAt = coupon.updatedAt;

    return couponDto;
  }
}
