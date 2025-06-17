import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org-quicko/core';
import { CouponSummaryWorkbook } from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import { CouponSummaryMv } from '../../entities/coupon-summary.view';
import { CouponSummaryTableConverter } from './coupon-summary-table.converter';

@Injectable()
export class CouponSummaryWorkbookConverter {

  private couponSummaryTableConverter: CouponSummaryTableConverter;

  constructor() {
    this.couponSummaryTableConverter = new CouponSummaryTableConverter();
  }

  convert(
    couponSummaryMv: CouponSummaryMv[],
    organizationId: string,
  ): CouponSummaryWorkbook {

    const couponSummaryWorkbook = new CouponSummaryWorkbook();

    const couponSummarySheet = couponSummaryWorkbook.getCouponSummarySheet();

    const couponSummaryTable = couponSummarySheet.getCouponSummaryTable();

    this.couponSummaryTableConverter.convert(couponSummaryTable, couponSummaryMv);

    couponSummaryWorkbook.setMetadata(new JSONObject({
      organization_id: organizationId,
    }));


    return couponSummaryWorkbook;
  }
}