import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { CouponCodeDto } from '../../dtos/coupon-code.dto';
import { CouponCodeFilter } from '../types/coupon-code-filter.interface';

@Injectable({
  providedIn: 'root'
})
export class CouponCodeService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchCouponCodes(organizationId: string, couponId: string, campaignId: string, filter?: CouponCodeFilter, skip:number = 0, take: number = 10) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes";

    let params = new HttpParams()
        .set('skip', skip)
        .set('take', take);
    
    if(filter && filter.query) {
      params = params.set('code', filter.query)
    }

    if(filter && filter.durationType) {
      params = params.set('duration_type', filter.durationType)
    }

    if(filter && filter.visibility) {
      params = params.set('visibility', filter.visibility);
    }

    if(filter && filter.status) {
      params = params.set('status', filter.status);
    }

    if(filter && filter.sortBy && filter.sortOrder) {
      params = params.set('sort_by', filter.sortBy);
      params = params.set('sort_order', filter.sortOrder);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<CouponCodeDto>>>(url, {
      params
    });
  }

  activateCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId + "/reactivate";
    return this.httpClient.patch<ApiResponse<any>>(url, null);
  }

  deactivateCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId + "/deactivate";
    return this.httpClient.patch<ApiResponse<any>>(url, null);
  }

  fetchCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId;
    return this.httpClient.get<ApiResponse<CouponCodeDto>>(url);
  }
}
