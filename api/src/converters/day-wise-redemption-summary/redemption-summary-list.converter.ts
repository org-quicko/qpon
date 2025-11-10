import { RedemptionSummaryList } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';

export class RedemptionSummaryListConverter {
    convert(dayWiseSummaries: DayWiseRedemptionSummaryMv[]): RedemptionSummaryList {
        const list = new RedemptionSummaryList();

        const totalRedemptions = dayWiseSummaries.reduce(
            (sum, mv) => sum + Number(mv.totalRedemptionsCount || 0),
            0,
        );
        const grossSalesAmount = dayWiseSummaries.reduce(
            (sum, mv) => sum + Number(mv.grossSalesAmount || 0),
            0,
        );
        const discountAmount = dayWiseSummaries.reduce(
            (sum, mv) => sum + Number(mv.discountAmount || 0),
            0,
        );
        const netSalesAmount = dayWiseSummaries.reduce(
            (sum, mv) => sum + Number(mv.netSalesAmount || 0),
            0,
        );

        const discountPercentage =
            grossSalesAmount > 0 ? (discountAmount / grossSalesAmount) * 100 : 0;

        // ✅ Use the built-in methods to populate the list
        list.addTotalRedemptions(totalRedemptions);
        list.addGrossSalesAmount(grossSalesAmount);
        list.addDiscountAmount(discountAmount);
        list.addDiscountPercentage(Number(discountPercentage.toFixed(2)));
        list.addNetSalesAmount(netSalesAmount);

        return list;
    }
}
