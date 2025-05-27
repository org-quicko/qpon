import { Injectable } from '@nestjs/common';
import { JSONArray, JSONObject } from '@org-quicko/core';
import { Redemption } from '../entities/redemption.entity';
import {
  RedemptionRow,
  RedemptionWorkbook,
} from 'generated/sources/redemption_workbook';

@Injectable()
export class RedemptionSheetConverter {
  convert(
    redemptions: Redemption[],
    organizationId: string,
    count?: number,
    skip?: number,
    take?: number,
  ): RedemptionWorkbook {
    const redemptionWorkbook = new RedemptionWorkbook();
    const redemptionSheet = redemptionWorkbook.getRedemptionSheet();
    const redemptionTable = redemptionSheet.getRedemptionTable();

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
      redemptionTable.addRow(redemptionRow);
    };

    redemptionWorkbook.setMetadata(new JSONObject({
      organization_id: organizationId,
    }));

    redemptionTable.setMetadata(new JSONObject({
      count: count,
      skip: skip,
      take: take,
    }));

    return redemptionWorkbook;
  }
}
