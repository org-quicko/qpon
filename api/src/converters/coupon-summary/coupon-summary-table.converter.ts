import { JSONArray } from '@org-quicko/core';
import {
  CouponSummaryRow,
  CouponSummaryTable,
} from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import { CouponSummaryMv } from 'src/entities/coupon-summary.view';

export class CouponSummaryTableConverter {
  convert(
    couponSummaryTable: CouponSummaryTable,
    couponSummaryMv: CouponSummaryMv[],
  ) {
    for (let index = 0; index < couponSummaryMv.length; index++) {
      const couponSummary = couponSummaryMv[index];
      const couponSummaryRow = new CouponSummaryRow(new JSONArray());
      couponSummaryRow.setCouponId(couponSummary.couponId);
      couponSummaryRow.setTotalRedemptionCount(
        couponSummary.totalRedemptionCount,
      );
      couponSummaryRow.setTotalRedemptionAmount(
        couponSummary.totalRedemptionAmount,
      );
      couponSummaryRow.setActiveCampaignCount(
        couponSummary.activeCampaignCount,
      );
      couponSummaryRow.setActiveCouponCodeCount(
        couponSummary.activeCouponCodeCount,
      );
      couponSummaryRow.setRedeemedCouponCodeCount(
        couponSummary.redeemedCouponCodeCount,
      );
      couponSummaryRow.setCreatedAt(couponSummary.createdAt.toISOString());
      couponSummaryRow.setUpdatedAt(couponSummary.updatedAt.toISOString());

      couponSummaryTable.addRow(couponSummaryRow);
    }
  }
}
