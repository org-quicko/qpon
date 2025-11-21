import { Injectable } from '@nestjs/common';
import { RedemptionSummaryWorkbook } from '@org-quicko/qpon-sheet-core/redemption_summary_workbook/beans';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';
import { RedemptionSummaryTableConverter } from './redemption-summary-table.converter';
import { RedemptionSummaryListConverter } from './redemption-summary-list.converter';

@Injectable()
export class RedemptionSummaryWorkbookConverter {
  constructor(
    private redemptionSummaryTableConverter: RedemptionSummaryTableConverter,
    private redemptionSummaryListConverter: RedemptionSummaryListConverter,
  ) { }

  convert(dayWiseSummaries: DayWiseRedemptionSummaryMv[]): RedemptionSummaryWorkbook {
    const workbook = new RedemptionSummaryWorkbook();
    const sheet = workbook.getRedemptionSummarySheet();

    const redemptionSummaryTable = this.redemptionSummaryTableConverter.convert(dayWiseSummaries);
    sheet.replaceBlock(redemptionSummaryTable);

    const redemptionSummaryList = this.redemptionSummaryListConverter.convert(dayWiseSummaries);
    sheet.replaceBlock(redemptionSummaryList);

    return workbook;
  }
}
