import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { CreateOrganizationDto, OrganizationDto } from '../../dtos/organization.dto';
import { OrganizationMvDto } from '../../dtos/organizationsMv.dto';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {

  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) {}

  fetchOrganization(organizationId: string) {
    const url = this.endpoint + '/organizations/' + organizationId;
    return this.httpClient.get<ApiResponse<OrganizationDto>>(url);
  }

  fetchOrganizations() {
    const url = this.endpoint + '/organizations';
    return this.httpClient.get<ApiResponse<OrganizationMvDto>>(url);
  }

  createOrganization(body: CreateOrganizationDto) {
    const url = this.endpoint + '/organizations';
    return this.httpClient.post<ApiResponse<OrganizationDto>>(url, body);
  }
}
