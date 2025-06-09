import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import {
  CreateOrganizationDto,
  OrganizationDto,
} from '../../dtos/organization.dto';
import { OrganizationMvDto } from '../../dtos/organizationsMv.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { sortOrderEnum } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) {}

  fetchOrganization(organizationId: string) {
    const url = this.endpoint + '/organizations/' + organizationId;
    return this.httpClient.get<ApiResponse<OrganizationDto>>(url);
  }

  fetchOrganizations(name?: string,  sortOptions?: { sortBy: string, sortOrder: sortOrderEnum }, skip: number = 0, take: number = 10) {
    const url = this.endpoint + '/organizations';

    let params = new HttpParams().set('skip', skip).set('take', take);

    if (name?.length ?? 0 > 0) {
      params = params.set('name', name!);
    }

    if(sortOptions) {
      params = params
        .set('sort_by', sortOptions.sortBy)
        .set('sort_order', sortOptions.sortOrder);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<OrganizationMvDto>>>(url, { params });
  }

  createOrganization(body: CreateOrganizationDto) {
    const url = this.endpoint + '/organizations';
    return this.httpClient.post<ApiResponse<OrganizationDto>>(url, body);
  }
}
