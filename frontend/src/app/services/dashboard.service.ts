import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { Observable, of } from 'rxjs';

import { RedemptionWorkbook } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { RedemptionSummaryWorkbook } from '@org-quicko/qpon-sheet-core/redemption_summary_workbook/beans';
import { ItemsSummaryWorkbook } from '@org-quicko/qpon-sheet-core/items_summary_workbook/beans';
import { CouponCodeSummaryWorkbook } from '@org-quicko/qpon-sheet-core/coupon_code_summary_workbook/beans';

import { sortOrderEnum } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) { }

  /**
   * Fetches day-wise sales summary for an organization.
   */
  fetchSalesSummary(
    organizationId: string,
    startDate?: string | Date,
    endDate?: string | Date
  ): Observable<ApiResponse<RedemptionSummaryWorkbook> | null> {
    const url = `${this.endpoint}/organizations/${organizationId}/sales/summary`;

    if ((startDate && !endDate) || (!startDate && endDate)) {
      console.warn('Skipping API call: both startDate and endDate must be provided together.');
      return of(null);
    }

    let params = new HttpParams();
    if (startDate && endDate) {
      params = params
        .set('start_date', typeof startDate === 'string' ? startDate : startDate.toISOString())
        .set('end_date', typeof endDate === 'string' ? endDate : endDate.toISOString());
    }

    return this.httpClient.get<ApiResponse<RedemptionSummaryWorkbook>>(url, {
      params: startDate && endDate ? params : undefined,
    });
  }

  /**
   * Fetches item summary for an organization.
   */
  fetchItemsSummary(
    organizationId: string,
    startDate?: string | Date,
    endDate?: string | Date
  ): Observable<ApiResponse<ItemsSummaryWorkbook> | null> {
    const url = `${this.endpoint}/organizations/${organizationId}/items/summary`;

    if ((startDate && !endDate) || (!startDate && endDate)) {
      console.warn('Skipping API call: both startDate and endDate must be provided together.');
      return of(null);
    }

    let params = new HttpParams();
    if (startDate && endDate) {
      params = params
        .set('start_date', typeof startDate === 'string' ? startDate : startDate.toISOString())
        .set('end_date', typeof endDate === 'string' ? endDate : endDate.toISOString());
    }

    const headers = new HttpHeaders({
      'x-accept-type': 'application/json;format=sheet-json',
    });

    return this.httpClient.get<ApiResponse<ItemsSummaryWorkbook>>(url, {
      params: startDate && endDate ? params : undefined,
      headers,
    });
  }

  /**
   * Fetches coupon code summary for an organization.
   */
  fetchCouponCodesSummary(
    organizationId: string,
    startDate?: string | Date,
    endDate?: string | Date
  ): Observable<ApiResponse<CouponCodeSummaryWorkbook> | null> {
    const url = `${this.endpoint}/organizations/${organizationId}/coupon_codes/summary`;

    if ((startDate && !endDate) || (!startDate && endDate)) {
      console.warn('Skipping API call: both startDate and endDate must be provided together.');
      return of(null);
    }

    let params = new HttpParams();
    if (startDate && endDate) {
      params = params
        .set('start_date', typeof startDate === 'string' ? startDate : startDate.toISOString())
        .set('end_date', typeof endDate === 'string' ? endDate : endDate.toISOString());
    }

    const headers = new HttpHeaders({
      'x-accept-type': 'application/json;format=sheet-json',
    });

    return this.httpClient.get<ApiResponse<CouponCodeSummaryWorkbook>>(url, {
      params: startDate && endDate ? params : undefined,
      headers,
    });
  }

  fetchRedemptionsForOrganization(
    organizationId: string,
    filter?: { email: string },
    sortOptions?: { sortBy: string; sortOrder: sortOrderEnum },
    skip: number = 0,
    take: number = 10
  ) {
    const url = `${this.endpoint}/organizations/${organizationId}/redemptions`;

    let params = new HttpParams().set('skip', skip).set('take', take);

    if (filter && filter.email) {
      params = params.set('customer_email', filter.email);
    }

    if (sortOptions) {
      params = params
        .set('sort_by', sortOptions.sortBy)
        .set('sort_order', sortOptions.sortOrder);
    }

    return this.httpClient.get<ApiResponse<RedemptionWorkbook>>(url, {
      params,
      headers: {
        'x-accept-type': 'application/json;format=sheet-json',
      },
    });
  }
}
