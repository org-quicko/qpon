import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org-quicko/core';
import { Redemption } from '../../entities/redemption.entity';
import { RedemptionWorkbook } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { RedemptionTableConverter } from './redemption-table.converter';

@Injectable()
export class RedemptionWorkbookConverter {

  private redemptionTableConverter: RedemptionTableConverter;

  constructor() {
    this.redemptionTableConverter = new RedemptionTableConverter();
  }

  convert(
    redemptions: Redemption[],
    organizationId: string,
    count?: number,
    skip?: number,
    take?: number,
  ): RedemptionWorkbook {
    const redemptionWorkbook = new RedemptionWorkbook();
    const redemptionSheet = redemptionWorkbook.getRedemptionSheet();

    const redemptionTable = this.redemptionTableConverter.convert(redemptions, count, skip, take);

    redemptionSheet.replaceBlock(redemptionTable);

    redemptionWorkbook.setMetadata(new JSONObject({
      organization_id: organizationId,
    }));

    return redemptionWorkbook;
  }
}
