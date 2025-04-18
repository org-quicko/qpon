import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CreateItemDto, ItemDto, UpdateItemDto } from '../../dtos/item.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { ItemFilter } from '../types/item-filter.interface';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private endpoint = environment.api_qpon_dev;

  constructor(private httpClient: HttpClient) {}

  fetchItems(
    organizationId: string,
    take: number = 10,
    skip: number = 0,
    filter?: ItemFilter
  ) {
    const url = this.endpoint + '/organizations/' + organizationId + '/items';

    let params = new HttpParams().set('skip', skip).set('take', take);

    if(filter?.query) {
      params = params.set('name', filter.query);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<ItemDto>>>(url, {
      params
    });
  }

  deleteItem(organizationId: string, itemId: string) {
    const url = this.endpoint + '/organizations/' + organizationId + '/items';
    return this.httpClient.delete<ApiResponse<any>>(url);
  }

  createItem(organizationId: string, body: CreateItemDto) {
    const url = this.endpoint + '/organizations/' + organizationId + '/items';
    return this.httpClient.post<ApiResponse<ItemDto>>(url, body);
  }

  fetchItem(organizationId: string, itemId: string) {
    const url = this.endpoint + '/organizations/' + organizationId + '/items/' + itemId;
    return this.httpClient.get<ApiResponse<ItemDto>>(url);
  }

  updateItem(organizationId: string, itemId: string, body: UpdateItemDto) {
    const url = this.endpoint + '/organizations/' + organizationId + '/items/' + itemId;
    return this.httpClient.patch<ApiResponse<ItemDto>>(url, body);
  }
}
