import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org.quicko/core';
import {
  CouponCodeRow,
  CouponCodeSheet,
  CouponCodeTable,
  CouponCodeWorkbook,
} from 'generated/sources/coupon_code_workbook';
import { CouponCode } from '../entities/coupon-code.entity';

@Injectable()
export class CouponCodeSheetConverter {
  convert(
    couponCodes: CouponCode[],
    organizationId: string,
  ): CouponCodeWorkbook {
    const couponCodeTable = new CouponCodeTable();
    couponCodes.map((couponCode) => {
      const couponCodeRow = new CouponCodeRow([]);
      couponCodeRow.setCouponId(couponCode.coupon.couponId);
      couponCodeRow.setCampaignId(couponCode.campaign.campaignId);
      couponCodeRow.setCouponCodeId(couponCode.couponCodeId);
      couponCodeRow.setCode(couponCode.code);
      couponCodeRow.setStatus(couponCode.status);
      couponCodeRow.setDescription(couponCode.description);
      couponCodeRow.setMaxRedemptions(couponCode.maxRedemptions);
      couponCodeRow.setRedemptionCount(couponCode.redemptionCount);
      couponCodeRow.setMaxRedemptionPerCustomer(
        couponCode.maxRedemptionPerCustomer,
      );
      couponCodeRow.setMinimumAmount(couponCode.minimumAmount);
      couponCodeRow.setCustomerConstraint(couponCode.customerConstraint);
      couponCodeRow.setVisibility(couponCode.visibility);
      couponCodeRow.setDurationType(couponCode.durationType);
      couponCodeRow.setExpiresAt(
        couponCode.expiresAt ? couponCode.expiresAt.toString() : null,
      );
      couponCodeRow.setCreatedAt(couponCode.createdAt.toString());
      couponCodeRow.setUpdatedAt(couponCode.updatedAt.toString());
      couponCodeTable.addRow(couponCodeRow);
    });

    const couponCodeSheet = new CouponCodeSheet();
    couponCodeSheet.addCouponCodeTable(couponCodeTable);

    const couponCodeWorkbook = new CouponCodeWorkbook();
    couponCodeWorkbook.addCouponCodeSheet(couponCodeSheet);
    const couponCodeWorkbookMetadata = new JSONObject({
      organization_id: organizationId,
    });

    couponCodeWorkbook.setMetadata(
      couponCodeWorkbookMetadata
    );

    return couponCodeWorkbook;
  }
}
