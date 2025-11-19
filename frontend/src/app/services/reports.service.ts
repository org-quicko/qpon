import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private endpoint = environment.base_url;

  constructor(private http: HttpClient) {}

  /**
   * Helper to build date query params
   */
  private buildDateParams(from: string, to: string) {
    return new HttpParams()
      .set('from', from)
      .set('to', to);
  }

  /**
   * Generic CSV download
   */
  private getCsv(url: string, params: HttpParams) {
    return this.http.get(url, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Redemptions Report
   * GET /organizations/:orgId/redemptions/reports?from=...&to=...
   */
  getRedemptionsReport(organizationId: string, from: string, to: string) {
    const url = `${this.endpoint}/organizations/${organizationId}/redemptions/reports`;
    const params = this.buildDateParams(from, to);
    return this.getCsv(url, params);
  }

  /**
   * Items Report
   * GET /organizations/:orgId/items/reports?from=...&to=...
   */
  getItemsReport(organizationId: string, from: string, to: string) {
    const url = `${this.endpoint}/organizations/${organizationId}/items/reports`;
    const params = this.buildDateParams(from, to);
    return this.getCsv(url, params);
  }

  /**
   * Customers Report
   * GET /organizations/:orgId/customers/reports?from=...&to=...
   */
  getCustomersReport(organizationId: string, from: string, to: string) {
    const url = `${this.endpoint}/organizations/${organizationId}/customers/reports`;
    const params = this.buildDateParams(from, to);
    return this.getCsv(url, params);
  }
}
