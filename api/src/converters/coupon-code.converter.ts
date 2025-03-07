import { Injectable } from '@nestjs/common';
import { CouponCodeDto } from '../dtos';
import { CouponCode } from '../entities/coupon-code.entity';

@Injectable()
export class CouponCodeConverter {
  convert(couponCode: CouponCode): CouponCodeDto {
    const couponCodeDto = new CouponCodeDto();

    couponCodeDto.couponCodeId = couponCode.couponCodeId;
    couponCodeDto.code = couponCode.code;
    couponCodeDto.description = couponCode.description;
    couponCodeDto.customerConstraint = couponCode.customerConstraint;
    couponCodeDto.maxRedemptions = couponCode.maxRedemptions;
    couponCodeDto.maxRedemptionPerCustomer =
      couponCode.maxRedemptionPerCustomer;
    couponCodeDto.minimumAmount = couponCode.minimumAmount;
    couponCodeDto.visibility = couponCode.visibility;
    couponCodeDto.durationType = couponCode.durationType;
    couponCodeDto.expiresAt = couponCode.expiresAt;
    couponCodeDto.status = couponCode.status;
    couponCodeDto.createdAt = couponCode.createdAt;
    couponCodeDto.updatedAt = couponCode.updatedAt;

    return couponCodeDto;
  }
}
