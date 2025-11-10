import { Injectable } from '@nestjs/common';
import { CouponCodeSummaryWorkbook } from '@org-quicko/qpon-sheet-core/coupon_code_summary_workbook/beans';
import { CouponCodesWiseDayWiseRedemptionSummaryMv } from 'src/entities/coupon-codes-wise-day-wise-redemption-summary-mv';
import { CouponCodeSummaryTableConverter } from './coupon-code-summary-table.converter';

@Injectable()
export class CouponCodeSummaryWorkbookConverter {
  private couponCodeSummaryTableConverter: CouponCodeSummaryTableConverter;

  constructor() {
    this.couponCodeSummaryTableConverter = new CouponCodeSummaryTableConverter();
  }

  convert(
    couponSummaryMvs: CouponCodesWiseDayWiseRedemptionSummaryMv[],
  ): CouponCodeSummaryWorkbook {
    const couponCodeSummaryWorkbook = new CouponCodeSummaryWorkbook();
    const couponCodeSummarySheet =
      couponCodeSummaryWorkbook.getCouponCodeSummarySheet();

    const couponCodeSummaryTable =
      this.couponCodeSummaryTableConverter.convert(couponSummaryMvs);

    couponCodeSummarySheet.replaceBlock(couponCodeSummaryTable);

    return couponCodeSummaryWorkbook;
  }
}
