import { Injectable } from '@nestjs/common';
import { JSONArray, JSONObject } from '@org-quicko/core';
import {
  CampaignSummaryRow,
  CampaignSummaryWorkbook,
} from 'generated/sources/campaign_summary_workbook';
import { CampaignSummaryMv } from '../entities/campaign-summary.view';

@Injectable()
export class CampaignSummarySheetConverter {
  convert(
    campaignSummaryMv: CampaignSummaryMv[],
    couponId: string,
    count?: number,
    skip?: number,
    take?: number,
  ): CampaignSummaryWorkbook {
    const campaignSummaryWorkbook = new CampaignSummaryWorkbook();

    const campaignSummarySheet =
      campaignSummaryWorkbook.getCampaignSummarySheet();

    const campaignSummaryTable = campaignSummarySheet.getCampaignSummaryTable();

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

    campaignSummaryTable.setMetadata(
      new JSONObject({
        coupon_id: couponId,
        count: count,
        skip: skip,
        take: take,
      }),
    );

    return campaignSummaryWorkbook;
  }
}
