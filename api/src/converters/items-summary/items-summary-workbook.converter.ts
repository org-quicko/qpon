import { Injectable } from '@nestjs/common';
import { ItemsSummaryWorkbook } from '@org-quicko/qpon-sheet-core/items_summary_workbook/beans';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';
import { ItemsSummaryTableConverter } from './items-summary-table.converter';

@Injectable()
export class ItemsSummaryWorkbookConverter {
  private itemsSummaryTableConverter: ItemsSummaryTableConverter;

  constructor() {
    this.itemsSummaryTableConverter = new ItemsSummaryTableConverter();
  }

  convert(itemSummaryMvs: ItemWiseDayWiseRedemptionSummaryMv[]): ItemsSummaryWorkbook {
    const itemsSummaryWorkbook = new ItemsSummaryWorkbook();
    const itemsSummarySheet = itemsSummaryWorkbook.getItemsSummarySheet();

    const itemsSummaryTable = this.itemsSummaryTableConverter.convert(itemSummaryMvs);

    itemsSummarySheet.replaceBlock(itemsSummaryTable);

    return itemsSummaryWorkbook;
  }
}
