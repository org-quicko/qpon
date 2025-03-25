import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { ApiResponse } from '../../dtos/api-response.dto';
import { OrganizationDto } from '../../dtos/organization.dto';

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
}
