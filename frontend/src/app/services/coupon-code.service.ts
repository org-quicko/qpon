import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { CouponCodeDto, CreateCouponCodeDto, UpdateCouponCodeDto } from '../../dtos/coupon-code.dto';
import { CouponCodeFilter } from '../types/coupon-code-filter.interface';
import { instanceToPlain } from 'class-transformer';
import { sortOrderEnum } from '../../enums';

@Injectable({
  providedIn: 'root'
})
export class CouponCodeService {
  private endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) {}

  fetchCouponCodes(organizationId: string, couponId: string, campaignId: string, filter?: CouponCodeFilter, sortOptions?: { sortBy: string, sortOrder: sortOrderEnum }, skip:number = 0, take: number = 10) {
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

    if(sortOptions) {
      params = params.set('sort_by', sortOptions.sortBy);
      params = params.set('sort_order', sortOptions.sortOrder);
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

  createCouponCode(organizationId: string, couponId: string, campaignId: string, body: CreateCouponCodeDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes";
    return this.httpClient.post<ApiResponse<CouponCodeDto>>(url, body);
  }

  updateCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string, body: UpdateCouponCodeDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId;
    return this.httpClient.patch<ApiResponse<CouponCodeDto>>(url, body);
  }

  deleteCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId;
    return this.httpClient.delete<ApiResponse<any>>(url);
  }
}
