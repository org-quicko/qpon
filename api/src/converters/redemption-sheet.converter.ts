import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org.quicko/core';
import { Redemption } from '../entities/redemption.entity';
import {
  RedemptionRow,
  RedemptionSheet,
  RedemptionTable,
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
    const redemptionTable = new RedemptionTable();

    redemptions.map((redemption) => {
      const redemptionRow = new RedemptionRow([]);
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
    });

    const redemptionSheet = new RedemptionSheet();
    redemptionSheet.addRedemptionTable(redemptionTable);

    const redemptionWorkbook = new RedemptionWorkbook();
    redemptionWorkbook.addRedemptionSheet(redemptionSheet);

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
