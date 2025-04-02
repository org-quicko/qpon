import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org.quicko/core';
import {
  CampaignSummaryRow,
  CampaignSummarySheet,
  CampaignSummaryTable,
  CampaignSummaryWorkbook,
} from 'generated/sources/campaign_summary_workbook';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';

@Injectable()
export class CampaignSummarySheetConverter {
  convert(campaignSummaryMv: CampaignSummaryMv[]): CampaignSummaryWorkbook {
    const campaignSummaryTable = new CampaignSummaryTable();

    campaignSummaryMv.map((campaignSummary) => {
      const campaignSummaryRow = new CampaignSummaryRow([]);
      campaignSummaryRow.setCampaignId(campaignSummary.campaignId);
      campaignSummaryRow.setName(campaignSummary.name);
      campaignSummaryRow.setBudget(campaignSummary.budget);
      campaignSummaryRow.setTotalRedemptionCount(
        campaignSummary.totalRedemptionCount,
      );
      campaignSummaryRow.setTotalRedemptionAmount(
        campaignSummary.totalRedemptionAmount,
      );
      campaignSummaryRow.setActiveCouponCodeCount(
        campaignSummary.activeCouponCodeCount,
      );
      campaignSummaryRow.setStatus(campaignSummary.status);
      campaignSummaryRow.setCreatedAt(campaignSummary.createdAt.toISOString());
      campaignSummaryRow.setUpdatedAt(campaignSummary.updatedAt.toISOString());

      campaignSummaryTable.addRow(campaignSummaryRow);
    });

    const campaignSummarySheet = new CampaignSummarySheet();
    campaignSummarySheet.addCampaignSummaryTable(campaignSummaryTable);

    const campaignSummaryWorkbook = new CampaignSummaryWorkbook();
    campaignSummaryWorkbook.addCampaignSummarySheet(campaignSummarySheet);

    campaignSummaryWorkbook.metadata = new JSONObject({
      organization_id: campaignSummaryMv[0].organizationId,
      coupon_id: campaignSummaryMv[0].couponId,
    });

    return campaignSummaryWorkbook;
  }
}
