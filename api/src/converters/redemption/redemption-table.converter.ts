import { JSONArray, JSONObject } from '@org-quicko/core';
import { RedemptionRow, RedemptionTable } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { Redemption } from '../../entities/redemption.entity';

export class RedemptionTableConverter {
  convert(redemptions: Redemption[], count?: number, skip?: number, take?: number) : RedemptionTable {
    const redemptionTable = new RedemptionTable();

    for (let index = 0; index < redemptions.length; index++) {
      const redemption = redemptions[index];
      const redemptionRow = new RedemptionRow(new JSONArray());
      redemptionRow.setRedemptionId(redemption.redemptionId);
      redemptionRow.setCouponCodeId(redemption.couponCode.couponCodeId);
      redemptionRow.setCouponCode(redemption.couponCode.code);
      redemptionRow.setBaseOrderValue(redemption.baseOrderValue);
      redemptionRow.setDiscount(redemption.discount);
      redemptionRow.setCustomerName(redemption.customer.name);
      redemptionRow.setCustomerEmail(redemption.customer.email);
      redemptionRow.setRedeemedAt(redemption.createdAt.toISOString());
      redemptionRow.setExternalId(redemption.externalId);
      redemptionRow.setItemName(redemption.item.name);
      redemptionTable.addRow(redemptionRow);
    }

    redemptionTable.setMetadata(new JSONObject({
      count: count,
      skip: skip,
      take: take,
    }));

    return redemptionTable;
  }
}
