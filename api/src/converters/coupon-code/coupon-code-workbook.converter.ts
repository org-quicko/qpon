import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org-quicko/core';
import { CouponCodeWorkbook } from '@org-quicko/qpon-sheet-core/coupon_code_workbook/beans';
import { CouponCode } from '../../entities/coupon-code.entity';
import { CouponCodeTableConverter } from './coupon-code-table.converter';

@Injectable()
export class CouponCodeWorkbookConverter {

  private couponCodeTableConverter: CouponCodeTableConverter;

  constructor() {
    this.couponCodeTableConverter = new CouponCodeTableConverter();
  }

  convert(
    couponCodes: CouponCode[],
    organizationId: string,
  ): CouponCodeWorkbook {
    
    const couponCodeWorkbook = new CouponCodeWorkbook();
    const couponCodeSheet = couponCodeWorkbook.getCouponCodeSheet();

    const couponCodeTable = this.couponCodeTableConverter.convert(couponCodes);

    couponCodeSheet.replaceBlock(couponCodeTable);

    const couponCodeWorkbookMetadata = new JSONObject({
      organization_id: organizationId,
    });

    couponCodeWorkbook.setMetadata(couponCodeWorkbookMetadata);

    return couponCodeWorkbook;
  }
}
