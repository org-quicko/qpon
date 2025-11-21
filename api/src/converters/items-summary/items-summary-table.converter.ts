import { JSONArray } from '@org-quicko/core';
import {
  ItemsSummaryRow,
  ItemsSummaryTable,
} from '@org-quicko/qpon-sheet-core/items_summary_workbook/beans';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';

export class ItemsSummaryTableConverter {
  convert(itemSummaryMvs: ItemWiseDayWiseRedemptionSummaryMv[]): ItemsSummaryTable {
    const itemsSummaryTable = new ItemsSummaryTable();

    for (const mv of itemSummaryMvs) {
      const row = new ItemsSummaryRow(new JSONArray());
      row.setOrganizationId(mv.organizationId);
      row.setItemId(mv.itemId);
      row.setName(mv.itemName);
      row.setDate(mv.date.toISOString());
      row.setTotalRedemptions(mv.totalRedemptions);
      row.setCreatedAt(mv.createdAt.toISOString());
      row.setUpdatedAt(mv.updatedAt.toISOString());

      itemsSummaryTable.addRow(row);
    }

    return itemsSummaryTable;
  }
}
