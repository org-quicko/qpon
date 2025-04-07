import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { CouponDto } from '../../dtos/coupon.dto';
import { CouponFilter } from '../types/coupon-filter.interface';
import { CouponSummaryWorkbook } from '../../generated/sources/coupon_summary_workbook';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchCoupons(
    organizationId: string,
    skip: number = 0,
    take: number = 10,
    filter?: CouponFilter
  ) {
    const url = this.endpoint + '/organizations/' + organizationId + '/coupons';

    let params = new HttpParams()
        .set('skip', skip)
        .set('take', take);

    if (filter && filter.query) {
      params = params.set('name', filter.query);
    }

    if (filter && filter.couponStatus) {
      params = params.set('status', filter.couponStatus);
    }
    if (filter && filter.itemConstraint) {
      params = params.set('item_constraint', filter.itemConstraint);
    }
    if (filter && filter.discountType) {
      params = params.set('discount_type', filter.discountType);
    }

    if(filter && filter.sortBy && filter.sortOrder) {
      params = params.set('sort_by', filter.sortBy);
      params = params.set('sort_order', filter.sortOrder);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<CouponDto>>>(url, {
      params
    });
  }

  deactivateCoupon(organizationId: string, couponId: string) {
    const url =
      this.endpoint +
      '/organizations/' +
      organizationId +
      '/coupons/' +
      couponId +
      '/deactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  activateCoupon(organizationId: string, couponId: string) {
    const url =
      this.endpoint +
      '/organizations/' +
      organizationId +
      '/coupons/' +
      couponId +
      '/reactivate';
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  fetchCoupon(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId;
    return this.httpClient.get<ApiResponse<CouponDto>>(url);
  }

  fetchCouponSummary(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId  + "/summary";
    return this.httpClient.get<ApiResponse<CouponSummaryWorkbook>>(url, {
      headers: {
        'x-accept-type': "application/json;format=sheet-json"
      },
    })
  }
}
