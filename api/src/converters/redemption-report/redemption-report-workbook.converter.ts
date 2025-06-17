import { Injectable } from '@nestjs/common';
import { RedemptionReportWorkbook } from '@org-quicko/qpon-sheet-core/redemption_report_workbook/beans';
import { Redemption } from '../../entities/redemption.entity';
import { RedemptionReportTableConverter } from './redemption-report-table.converter';

@Injectable()
export class RedemptionReportWorkbookConverter {

  private redemptionReportTableConverter: RedemptionReportTableConverter;

  constructor() {
    this.redemptionReportTableConverter = new RedemptionReportTableConverter();
  }

  convert(redemptions: Redemption[]): RedemptionReportWorkbook {
    const redemptionReportWorkbook = new RedemptionReportWorkbook();
    
    const redemptionReportSheet = redemptionReportWorkbook.getRedemptionReportSheet();

    const redemptionReportTable = redemptionReportSheet.getRedemptionReportTable();

    this.redemptionReportTableConverter.convert(redemptionReportTable, redemptions);

    return redemptionReportWorkbook;
  }
}