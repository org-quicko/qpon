import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../dtos/api-response.dto';
import { environment } from '../../environments/environment.dev';
import { OrganizationUserDto } from '../../dtos/organization-user.dto';
import { UserDto } from '../../dtos/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  login(email: string, password: string) {
    let url = this.endpoint + "/users/login"
    return this.httpClient.post<ApiResponse<any>>(url, {
      email, 
      password
    })
  }

  fetchOrganizationsForUser(userId: string) {
    let url = this.endpoint + "/users/" + userId + "/organizations";
    return this.httpClient.get<ApiResponse<OrganizationUserDto[]>>(url);
  }

  fetchUser(userId: string) {
    let url = this.endpoint + "/users/" + userId;
    return this.httpClient.get<ApiResponse<UserDto>>(url);
  }
}
