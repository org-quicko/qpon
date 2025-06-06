import { Injectable } from '@nestjs/common';
import { JSONArray, JSONObject } from '@org-quicko/core';
import {
  CouponSummaryRow,
  CouponSummaryWorkbook,
} from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import { CouponSummaryMv } from '../entities/coupon-summary.view';

@Injectable()
export class CouponSummarySheetConverter {
  convert(
    couponSummaryMv: CouponSummaryMv[],
    organizationId: string,
  ): CouponSummaryWorkbook {

    const couponSummaryWorkbook = new CouponSummaryWorkbook();

    const couponSummarySheet = couponSummaryWorkbook.getCouponSummarySheet();

    const couponSummaryTable = couponSummarySheet.getCouponSummaryTable();

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
    };

    couponSummaryWorkbook.setMetadata(new JSONObject({
      organization_id: organizationId,
    }));

    return couponSummaryWorkbook;
  }
}
