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

  fetchCoupons(organizationId: string, skip: number = 0, take:number = 0) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons";
    return this.httpClient.get<ApiResponse<PaginatedList<CouponDto>>>(url,{
      params: {
        skip,
        take
      }
    })
  }
}
