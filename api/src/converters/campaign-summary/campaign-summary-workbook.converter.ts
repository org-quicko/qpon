import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org-quicko/core';
import { CampaignSummaryWorkbook } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import { CampaignSummaryMv } from '../../entities/campaign-summary.view';
import { CampaignSummaryTableConverter } from './campaign-summary-table.converter';

@Injectable()
export class CampaignSummaryWorkbookConverter {

  private campaignSummaryTableConverter: CampaignSummaryTableConverter;

  constructor() {
    this.campaignSummaryTableConverter = new CampaignSummaryTableConverter();
  }

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

    const campaignSummaryTable = this.campaignSummaryTableConverter.convert(campaignSummaryMv);

    campaignSummarySheet.replaceBlock(campaignSummaryTable);

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
