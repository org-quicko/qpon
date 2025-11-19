import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../dtos/api-response.dto';
import { environment } from '../../environments/environment';
import { OrganizationUserDto } from '../../dtos/organization-user.dto';
import { CreateUserDto, UpdateUserDto, UserDto } from '../../dtos/user.dto';
import { PaginatedList } from '../../dtos/paginated-list.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private endpoint = environment.base_url;

  constructor(private httpClient: HttpClient) { }

  login(email: string, password: string) {
    let url = this.endpoint + '/users/login';
    return this.httpClient.post<ApiResponse<any>>(url, {
      email,
      password,
    });
  }

  fetchOrganizationsForUser(userId: string) {
    let url = this.endpoint + '/users/' + userId + '/organizations';
    return this.httpClient.get<ApiResponse<OrganizationUserDto[]>>(url);
  }

  fetchUser(userId: string) {
    let url = this.endpoint + '/users/' + userId;
    return this.httpClient.get<ApiResponse<UserDto>>(url);
  }

  createUser(organizationId: string, body: CreateUserDto) {
    const url = this.endpoint + '/organizations/' + organizationId + '/users';
    return this.httpClient.post(url, body);
  }

  fetchUsers(email?: string, skip: number = 0, take: number = 10) {
    const url = this.endpoint + '/users';

    let params = new HttpParams().set('skip', skip).set('take', take);

    if (email && email.length > 0) {
      params = params.set('email', email!);
    }

    return this.httpClient.get<ApiResponse<PaginatedList<UserDto>>>(url, { params });
  }

  superAdminExists() {
    const url = this.endpoint + '/super-admin/exists';
    return this.httpClient.get<any>(url);
  }

  createSuperAdmin(body: CreateUserDto) {
    const url = this.endpoint + '/users';
    return this.httpClient.post<ApiResponse<UserDto>>(url, body);
  }

  updateUser(
    organizationId: string,
    userId: string,
    body: UpdateUserDto
  ) {
    const url = `${this.endpoint}/organizations/${organizationId}/users/${userId}`;
    return this.httpClient.patch<ApiResponse<UserDto>>(url, body);
  }
}
