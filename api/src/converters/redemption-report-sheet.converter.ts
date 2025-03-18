import { Injectable } from '@nestjs/common';
import {
  RedemptionReportRow,
  RedemptionReportSheet,
  RedemptionReportTable,
  RedemptionReportWorkbook,
} from 'generated/sources';
import { Redemption } from '../entities/redemption.entity';
import { formatDate } from '../utils/date.utils';

@Injectable()
export class RedemptionReportSheetConverter {
  convert(redemptions: Redemption[]): RedemptionReportWorkbook {
    const redemptionReportTable = new RedemptionReportTable();

    redemptions.map((redemption) => {
      const redemptionReportRow = new RedemptionReportRow([]);
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
    });

    const redemptionReportSheet = new RedemptionReportSheet();
    redemptionReportSheet.addRedemptionReportTable(redemptionReportTable);

    const redemptionReportWorkbook = new RedemptionReportWorkbook();
    redemptionReportWorkbook.addRedemptionReportSheet(redemptionReportSheet);

    return redemptionReportWorkbook;
  }
}
