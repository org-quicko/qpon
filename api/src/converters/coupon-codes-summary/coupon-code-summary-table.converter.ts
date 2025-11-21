import { JSONArray } from '@org-quicko/core';
import {
  CouponCodeSummaryRow,
  CouponCodeSummaryTable,
} from '@org-quicko/qpon-sheet-core/coupon_code_summary_workbook/beans';
import { CouponCodesWiseDayWiseRedemptionSummaryMv } from 'src/entities/coupon-codes-wise-day-wise-redemption-summary-mv';

export class CouponCodeSummaryTableConverter {
  convert(
    couponSummaryMvs: CouponCodesWiseDayWiseRedemptionSummaryMv[],
  ): CouponCodeSummaryTable {
    const couponCodeSummaryTable = new CouponCodeSummaryTable();

    for (const mv of couponSummaryMvs) {
      const row = new CouponCodeSummaryRow(new JSONArray());
      row.setOrganizationId(mv.organizationId);
      row.setCouponCodeId(mv.couponCodeId);
      row.setName(mv.couponCode);
      row.setDate(mv.date.toISOString());
      row.setTotalRedemptions(mv.totalRedemptions);
      row.setCreatedAt(mv.createdAt.toISOString());
      row.setUpdatedAt(mv.updatedAt.toISOString());

      couponCodeSummaryTable.addRow(row);
    }

    return couponCodeSummaryTable;
  }
}
