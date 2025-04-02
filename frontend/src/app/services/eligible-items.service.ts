import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { ItemDto } from '../../dtos/item.dto';

@Injectable({
  providedIn: 'root'
})
export class EligibleItemsService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchItemsForCoupon(organizationId: string, couponId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/coupons/" + couponId + "/items";
    return this.httpClient.get<ApiResponse<PaginatedList<ItemDto>>>(url);
  }
}
