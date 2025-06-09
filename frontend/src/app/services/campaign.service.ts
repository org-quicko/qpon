import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CampaignSummaryWorkbook } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';;
import {
  CampaignDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from '../../dtos/campaign.dto';
import { sortOrderEnum } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) {}

  fetchCampaignSummaries(
    organizationId: string,
    couponId: string,
    skip: number = 0,
    take: number = 10,
    name?: string,
    sortOptions?: { sortBy: string; sortOrder: sortOrderEnum }
  ) {
    const url = this.endpoint + '/organizations/' + organizationId + '/coupons/' + couponId + '/campaigns/summary';

    let params = new HttpParams().set('skip', skip).set('take', take);

    if (name) {
      params = params.set('name', name);
    }

    if (sortOptions) {
      params = params
        .set('sort_by', sortOptions.sortBy)
        .set('sort_order', sortOptions.sortOrder);
    }

    return this.httpClient.get<ApiResponse<CampaignSummaryWorkbook>>(url, {
      headers: {
        'x-accept-type': 'application/json;format=sheet-json',
      },
      params,
    });
  }

  fetchCampaignSummary(organizationId: string, couponId: string, campaignId: string) {
    const url =
      this.endpoint + '/organizations/' + organizationId +
      '/coupons/' +
      couponId +
      '/campaigns/' +
      campaignId +
      '/summary';
    return this.httpClient.get<ApiResponse<CampaignSummaryWorkbook>>(url, {
      headers: {
        'x-accept-type': 'application/json;format=sheet-json',
      },
    });
  }

  deactivateCampaign(organizationId: string, couponId: string, campaignId: string) {
    const url =
      this.endpoint + '/organizations/' + organizationId +
      '/coupons/' +
      couponId +
      '/campaigns/' +
      campaignId +
      '/deactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  activateCampaign(organizationId: string, couponId: string, campaignId: string) {
    const url =
      this.endpoint + '/organizations/' + organizationId +
      '/coupons/' +
      couponId +
      '/campaigns/' +
      campaignId +
      '/reactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  createCampaign(organizationId: string, couponId: string, body: CreateCampaignDto) {
    const url = this.endpoint + '/organizations/' + organizationId + '/coupons/' + couponId + '/campaigns';
    return this.httpClient.post<ApiResponse<CampaignDto>>(url, body);
  }

  fetchCampaign(organizationId: string, couponId: string, campaignId: string) {
    const url =
      this.endpoint + '/organizations/' + organizationId + '/coupons/' + couponId + '/campaigns/' + campaignId;
    return this.httpClient.get<ApiResponse<CampaignDto>>(url);
  }

  updateCampaign(
    organizationId: string,
    couponId: string,
    campaignId: string,
    body: UpdateCampaignDto
  ) {
    const url =
      this.endpoint + '/organizations/' + organizationId + '/coupons/' + couponId + '/campaigns/' + campaignId;
    return this.httpClient.patch<ApiResponse<CampaignDto>>(url, body);
  }

  deleteCampaign(organizationId: string, couponId: string, campaignId: string) {
    const url = this.endpoint + '/organizations/' + organizationId + '/coupons/' + couponId + '/campaigns/' + campaignId;
    return this.httpClient.delete<ApiResponse<any>>(url);
  }
}
