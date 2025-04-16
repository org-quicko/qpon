import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { ItemDto } from '../../dtos/item.dto';
import { CouponItemDto, UpdateCouponItemDto } from '../../dtos/coupon-item.dto';

@Injectable({
  providedIn: 'root'
})
export class EligibleItemsService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchItemsForCoupon(organizationId: string, couponId: string, filter?: {name: string}, skip: number = 0, take: number = 10) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/items";

    let params = new HttpParams()
      .set('skip', skip)
      .set('take', take);

      if(filter && filter.name) {
        params = params.set('name', filter.name);
      }

    return this.httpClient.get<ApiResponse<PaginatedList<ItemDto>>>(url, {params});
  }

  addItemsForCoupon(organizationId: string, couponId: string, items: string[]) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/items";
    return this.httpClient.post<ApiResponse<CouponItemDto>>(url, {"items": items});
  }

  updateItemsForCoupon(organizationId: string, couponId: string, items: string[]) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/items";
    return this.httpClient.patch<ApiResponse<CouponItemDto>>(url, {"items": items});
  }
}
