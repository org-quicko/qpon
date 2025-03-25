import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { ApiResponse } from '../../dtos/api-response.dto';
import { ItemDto } from '../../dtos/item.dto';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  fetchItems(organizationId: string, take:number  = 10, skip: number = 0) {
    const url = this.endpoint + "/organizations/" + organizationId + "/items"
    return this.httpClient.get<ApiResponse<ItemDto[]>>(url, {
      params: {
        take,
        skip
      }
    })
  }

  deleteItem(organizationId: string, itemId: string) {
    const url = this.endpoint + "/organizations/" + organizationId + "/items"
    return this.httpClient.delete<ApiResponse<any>>(url)
  }
}
