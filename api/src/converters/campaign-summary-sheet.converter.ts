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
  convert(
    campaignSummaryMv: CampaignSummaryMv[],
    count?: number,
    skip?: number,
    take?: number,
  ): CampaignSummaryWorkbook {
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

    if (campaignSummaryMv.length > 0) {
      campaignSummaryTable.metadata = new JSONObject({
        organization_id: campaignSummaryMv[0]?.organizationId,
        coupon_id: campaignSummaryMv[0].couponId,
        count: count,
        skip: skip,
        take: take,
      });
    }

    return campaignSummaryWorkbook;
  }
}
