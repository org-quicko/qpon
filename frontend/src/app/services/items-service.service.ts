import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class ItemsServiceService {

  private endpoint = environment.api_qpon_dev

  constructor(private httpClient: HttpClient) { }

  fetchItems(organizationId: string, take:number  = 10) {
    const url = this.endpoint + "/organizations" + organizationId + "/items"
    return this.httpClient.get(url, {
      headers: {
        "authorization": environment.jwt_super_admin
      },
      params: {

      }
    })
  }
}
