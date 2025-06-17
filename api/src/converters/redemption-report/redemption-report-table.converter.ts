import { RedemptionReportRow, RedemptionReportTable } from '@org-quicko/qpon-sheet-core/redemption_report_workbook/beans';
import { Redemption } from '../../entities/redemption.entity';
import { JSONArray } from '@org-quicko/core';
import { formatDate } from '../../utils/date.utils';

export class RedemptionReportTableConverter {
  convert(
    redemptionReportTable: RedemptionReportTable,
    redemptions: Redemption[],
  ) {
    for (let index = 0; index < redemptions.length; index++) {
      const redemption = redemptions[index];
      const redemptionReportRow = new RedemptionReportRow(new JSONArray());
      redemptionReportRow.setRedemptionId(redemption.redemptionId);
      redemptionReportRow.setCouponCodeId(redemption.couponCode.couponCodeId);
      redemptionReportRow.setCouponCode(redemption.couponCode.code);
      redemptionReportRow.setCampaignId(redemption.campaign.campaignId);
      redemptionReportRow.setCampaignName(redemption.campaign.name);
      redemptionReportRow.setCouponId(redemption.coupon.couponId);
      redemptionReportRow.setCouponName(redemption.coupon.name);
      redemptionReportRow.setDiscountAmount(redemption.discount);
      redemptionReportRow.setExternalItemId(redemption.item.externalId);
      redemptionReportRow.setItemName(redemption.item.name);
      redemptionReportRow.setCustomerName(redemption.customer.name);
      redemptionReportRow.setCustomerEmail(redemption.customer.email);
      redemptionReportRow.setCustomerPhone(
        `${redemption.customer.isdCode} ${redemption.customer.phone}`,
      );
      redemptionReportRow.setExternalCustomerId(redemption.customer.externalId);
      redemptionReportRow.setRedeemedAt(formatDate(redemption.createdAt));
      redemptionReportTable.addRow(redemptionReportRow);
    }
  }
}
