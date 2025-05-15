import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org-quicko/core';
import {
  CouponSummaryRow,
  CouponSummarySheet,
  CouponSummaryTable,
  CouponSummaryWorkbook,
} from 'generated/sources/coupon_summary_workbook';
import { CouponSummaryMv } from '../entities/coupon-summary.view';

@Injectable()
export class CouponSummarySheetConverter {
  convert(
    couponSummaryMv: CouponSummaryMv[],
    organizationId: string,
  ): CouponSummaryWorkbook {
    const couponSummaryTable = new CouponSummaryTable();

    couponSummaryMv.map((couponSummary) => {
      const couponSummaryRow = new CouponSummaryRow([]);
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
    });

    const couponSummarySheet = new CouponSummarySheet();
    couponSummarySheet.addCouponSummaryTable(couponSummaryTable);

    const couponSummaryWorkbook = new CouponSummaryWorkbook();
    couponSummaryWorkbook.addCouponSummarySheet(couponSummarySheet);

    couponSummaryWorkbook.metadata = new JSONObject({
      organization_id: organizationId,
    });

    return couponSummaryWorkbook;
  }
}
