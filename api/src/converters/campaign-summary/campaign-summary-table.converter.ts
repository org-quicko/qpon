import {
  CampaignSummaryRow,
  CampaignSummaryTable,
} from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import { CampaignSummaryMv } from '../../entities/campaign-summary.view';
import { JSONArray } from '@org-quicko/core';

export class CampaignSummaryTableConverter {
    convert(campaignSummaryMv: CampaignSummaryMv[]) : CampaignSummaryTable {
    const campaignSummaryTable = new CampaignSummaryTable();

    for (let index = 0; index < campaignSummaryMv.length; index++) {
      const campaignSummaryRow = new CampaignSummaryRow(new JSONArray());
      campaignSummaryRow.setCampaignId(campaignSummaryMv[index].campaignId);
      campaignSummaryRow.setName(campaignSummaryMv[index].name);
      campaignSummaryRow.setBudget(campaignSummaryMv[index].budget);
      campaignSummaryRow.setTotalRedemptionCount(
        campaignSummaryMv[index].totalRedemptionCount,
      );
      campaignSummaryRow.setTotalRedemptionAmount(
        campaignSummaryMv[index].totalRedemptionAmount,
      );
      campaignSummaryRow.setActiveCouponCodeCount(
        campaignSummaryMv[index].activeCouponCodeCount,
      );
      campaignSummaryRow.setStatus(campaignSummaryMv[index].status);
      campaignSummaryRow.setCreatedAt(
        campaignSummaryMv[index].createdAt.toISOString(),
      );
      campaignSummaryRow.setUpdatedAt(
        campaignSummaryMv[index].updatedAt.toISOString(),
      );

      campaignSummaryTable.addRow(campaignSummaryRow);
    }
    
    return campaignSummaryTable;
  }
}
