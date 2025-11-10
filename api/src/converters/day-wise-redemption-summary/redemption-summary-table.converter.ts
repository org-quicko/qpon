import { JSONArray } from '@org-quicko/core';
import { DayWiseSalesRow, DayWiseSalesTable } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';

export class RedemptionSummaryTableConverter {
    convert(dayWiseSummaries: DayWiseRedemptionSummaryMv[]): DayWiseSalesTable {
        const table = new DayWiseSalesTable();

        for (const mv of dayWiseSummaries) {
            const row = new DayWiseSalesRow(new JSONArray());
            row.setDate(mv.date.toISOString());
            row.setGrossSalesAmount(mv.grossSalesAmount);
            row.setDiscountAmount(mv.discountAmount);
            row.setNetSalesAmount(mv.netSalesAmount);

            table.addRow(row);
        }

        return table;
    }
}
