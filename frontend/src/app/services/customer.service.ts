import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CreateCustomerDto, CustomerDto, UpdateCustomerDto } from '../../dtos/customer.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  fetchCustomers(organizationId: string, skip: number = 0, take:number  = 10, filter?: {email: string}) {
    const url = this.endpoint + "/organizations/" + organizationId + "/customers"

    let params = new HttpParams()
      .set('skip', skip)
      .set('take', take);

    if (filter && filter.email) {
      params = params.set('email', filter.email);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<CustomerDto>>>(url, {
      params
    })
  }

  createCustomer(organizationId: string, body: CreateCustomerDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/customers";
    return this.httpClient.post<ApiResponse<CustomerDto>>(url, body);
  }

  fetchCustomer(organizationId: string, customerId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/customers/" + customerId;
    return this.httpClient.get<ApiResponse<CustomerDto>>(url);
  }

  updateCustomer(organizationId: string, customerId: string, body: UpdateCustomerDto) {
    const url = this.endpoint + "/organizations/" + organizationId + "/customers/" + customerId;
    return this.httpClient.patch<ApiResponse<CustomerDto>>(url, body);
  }
}
