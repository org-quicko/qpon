import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { CouponDto, CreateCouponDto, UpdateCouponDto } from '../../dtos/coupon.dto';
import { CouponFilter } from '../types/coupon-filter.interface';
import { CouponSummaryWorkbook } from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';;
import { sortOrderEnum } from '../../enums';

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
    filter?: CouponFilter,
    sortOptions?: {sortBy: string, sortOrder: sortOrderEnum},
  ) {
    const url = this.endpoint + '/organizations/' + organizationId + '/coupons';

    let params = new HttpParams()
        .set('skip', skip)
        .set('take', take);

    if (filter && filter.query) {
      params = params.set('name', filter.query);
    }

    if (filter && filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter && filter.itemConstraint) {
      params = params.set('item_constraint', filter.itemConstraint);
    }
    if (filter && filter.discountType) {
      params = params.set('discount_type', filter.discountType);
    }

    if(sortOptions) {
      params = params.set('sort_by', sortOptions.sortBy);
      params = params.set('sort_order', sortOptions.sortOrder);
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

  createCoupon(organizationId: string, coupon: CreateCouponDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons";
    return this.httpClient.post<ApiResponse<CouponDto>>(url, coupon);
  }

  updateCoupon(organizationId: string, couponId: string, body: UpdateCouponDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId;
    return this.httpClient.patch<ApiResponse<CouponDto>>(url, body);
  }

  deleteCoupon(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId;
    return this.httpClient.delete<ApiResponse<any>>(url);
  }
}
