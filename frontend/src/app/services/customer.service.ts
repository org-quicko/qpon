import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CustomerDto } from '../../dtos/customer.dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  fetchCustomers(organizationId: string, take:number  = 10, skip: number = 0) {
    const url = this.endpoint + "/organizations/" + organizationId + "/customers"
    return this.httpClient.get<ApiResponse<CustomerDto[]>>(url, {
      params: {
        take,
        skip
      }
    })
  }
}
