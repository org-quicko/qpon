import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org.quicko/core';
import { Redemption } from '../entities/redemption.entity';
import {
  RedemptionRow,
  RedemptionSheet,
  RedemptionTable,
  RedemptionWorkbook,
} from 'generated/sources';

@Injectable()
export class RedemptionSheetConverter {
  convert(
    redemptions: Redemption[],
    organizationId: string,
  ): RedemptionWorkbook {
    const redemptionTable = new RedemptionTable();

    redemptions.map((redemption) => {
      const redemptionRow = new RedemptionRow([]);
      redemptionRow.setRedemptionId(redemption.redemptionId);
      redemptionRow.setCouponCodeId(redemption.couponCode.couponCodeId);
      redemptionRow.setCouponCode(redemption.couponCode.code);
      redemptionRow.setDiscount(redemption.amount);
      redemptionRow.setRedeemedAt(redemption.createdAt.toISOString());
      redemptionRow.setExternalId(redemption.externalId);
      redemptionTable.addRow(redemptionRow);
    });

    const redemptionSheet = new RedemptionSheet();
    redemptionSheet.addRedemptionTable(redemptionTable);

    const redemptionWorkbook = new RedemptionWorkbook();
    redemptionWorkbook.addRedemptionSheet(redemptionSheet);

    redemptionWorkbook.metadata = new JSONObject({
      organization_id: organizationId,
    });

    return redemptionWorkbook;
  }
}
