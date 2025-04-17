import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CreateCustomerCouponCodeDto, CustomerCouponCodeDto, UpdateCustomerCouponCodeDto } from '../../dtos/customer-coupon-code.dto';
import { CustomerDto } from '../../dtos/customer.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerCouponCodeService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  addCustomers(couponId: string, campaignId: string, couponCodeId: string, body: CreateCustomerCouponCodeDto) {
    const url = this.endpoint + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId + "/customers";
    return this.httpClient.post<ApiResponse<CustomerCouponCodeDto>>(url, body);
  }
  
  fetchCustomers(couponId: string, campaignId: string, couponCodeId: string) {
    const url = this.endpoint + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId + "/customers";
    return this.httpClient.get<ApiResponse<PaginatedList<CustomerDto>>>(url);
  }

  updateCustomers(couponId: string, campaignId: string, couponCodeId: string, body: UpdateCustomerCouponCodeDto) {
    const url = this.endpoint + "/coupons/" + couponId + "/campaigns/" + campaignId + "/coupon-codes/" + couponCodeId + "/customers";
    return this.httpClient.patch<ApiResponse<CustomerCouponCodeDto>>(url, body);
  }
}
