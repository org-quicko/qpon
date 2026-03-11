import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../dtos/api-response.dto';
import { ApiKeyDto } from '../../dtos/api-key.dto';

@Injectable({
  providedIn: 'root',
})
export class ApiKeysService {
  private endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) {}

  fetchApiKey(organizationId: string) {
    const url = `${this.endpoint}/organizations/${organizationId}/api-keys`;
    return this.httpClient.get<ApiResponse<ApiKeyDto>>(url);
  }

  generateApiKey(organizationId: string) {
    const url = `${this.endpoint}/organizations/${organizationId}/api-keys`;
    return this.httpClient.post<ApiResponse<ApiKeyDto>>(url, {});
  }
}
