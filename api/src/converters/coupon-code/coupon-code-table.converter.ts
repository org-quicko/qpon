import { CouponCodeRow, CouponCodeTable } from '@org-quicko/qpon-sheet-core/coupon_code_workbook/beans';
import { JSONArray } from '@org-quicko/core';
import { CouponCode } from '../../entities/coupon-code.entity';

export class CouponCodeTableConverter {
  convert(couponCodes: CouponCode[]) : CouponCodeTable {

    const couponCodeTable = new CouponCodeTable();

    for (let index = 0; index < couponCodes.length; index++) {
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
    }

    return couponCodeTable;
  }
}
