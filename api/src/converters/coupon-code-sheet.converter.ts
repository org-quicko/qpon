import { Injectable } from '@nestjs/common';
import { JSONArray, JSONObject } from '@org-quicko/core';
import {
  CouponCodeRow,
  CouponCodeWorkbook,
} from '@org-quicko/qpon-sheet-core/coupon_code_workbook/beans';
import { CouponCode } from '../entities/coupon-code.entity';

@Injectable()
export class CouponCodeSheetConverter {
  convert(
    couponCodes: CouponCode[],
    organizationId: string,
  ): CouponCodeWorkbook {
    
    const couponCodeWorkbook = new CouponCodeWorkbook();
    const couponCodeSheet = couponCodeWorkbook.getCouponCodeSheet();
    const couponCodeTable = couponCodeSheet.getCouponCodeTable();

    for(let index = 0; index < couponCodes.length; index++) {
      const couponCode = couponCodes[index];
      const couponCodeRow = new CouponCodeRow(new JSONArray());
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
    };

    const couponCodeWorkbookMetadata = new JSONObject({
      organization_id: organizationId,
    });

    couponCodeWorkbook.setMetadata(couponCodeWorkbookMetadata);

    return couponCodeWorkbook;
  }
}
