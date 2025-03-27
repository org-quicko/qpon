import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { CouponDto } from '../../dtos/coupon.dto';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  fetchCoupons(organizationId: string, skip: number = 0, take:number = 10) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons";
    return this.httpClient.get<ApiResponse<PaginatedList<CouponDto>>>(url,{
      params: {
        skip,
        take
      }
    })
  }

  deactivateCoupon(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/deactivate";
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }

  activateCoupon(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/reactivate";
    return this.httpClient.post<ApiResponse<any>>(url, null);
  }
}
