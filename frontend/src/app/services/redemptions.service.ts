import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { RedemptionWorkbook } from '../../generated/sources/redemption_workbook';
import { sortOrderEnum } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class RedemptionsService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchRedemptionsForCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    filter?: { email: string },
    sortOptions?: { sortBy: string; sortOrder: sortOrderEnum },
    skip: number = 0,
    take: number = 10
  ) {
    const url = `${this.endpoint}/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/redemptions`;

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
