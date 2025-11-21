import { signal, computed, inject } from '@angular/core';
import { DashboardService } from '../../../../services/dashboard.service';
import { transformSalesSummary, SalesSummaryWorkbook } from '../../../../utils/sales-summary.transformer';

export class SalesSummaryStore {
  private readonly dashboardService = inject(DashboardService);

  private _organizationId = signal<string | null>(null);
  private _startDate = signal<string | null>(null);
  private _endDate = signal<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);
  workbook = signal<SalesSummaryWorkbook | null>(null);

  graphData = computed(() => this.workbook()?.graphData ?? []);
  summaryItems = computed(() => this.workbook()?.summaryItems ?? []);

  setOrganizationId(id: string) {
    this._organizationId.set(id);
  }

  setDateRange(start: string | null, end: string | null) {
    this._startDate.set(start);
    this._endDate.set(end);
  }

  reset() {
    this.workbook.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }

  async fetchSalesSummary() {
    const orgId = this._organizationId();
    if (!orgId) {
      this.error.set('Organization ID missing');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res = await this.dashboardService
        .fetchSalesSummary(orgId, this._startDate() || undefined, this._endDate() || undefined)
        .toPromise();

      if (res?.code === 200 && res.data) {
        this.workbook.set(transformSalesSummary(res.data));
      } else {
        this.error.set(res?.message ?? 'No data available');
        this.workbook.set(null);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to fetch sales summary');
      this.workbook.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }
}
