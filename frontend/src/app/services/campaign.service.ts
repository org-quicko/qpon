import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CampaignSummaryWorkbook } from '../../generated/sources/campaign_summary_workbook';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchCampaignSummaries(couponId: string) {
    const url = this.endpoint + '/coupons/' + couponId + '/campaigns/summary';
    return this.httpClient.get<ApiResponse<CampaignSummaryWorkbook>>(url, {
      headers: {
        'x-accept-type': 'application/json;format=sheet-json',
      },
    });
  }

  deactivateCampaign(couponId: string, campaignId: string) {
    const url =
      this.endpoint +
      '/coupons/' +
      couponId +
      '/campaigns/' +
      campaignId +
      '/deactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  activateCampaign(couponId: string, campaignId: string) {
    const url =
      this.endpoint +
      '/coupons/' +
      couponId +
      '/campaigns/' +
      campaignId +
      '/reactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }
}
