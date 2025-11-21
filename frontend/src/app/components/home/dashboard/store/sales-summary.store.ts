import { signal, computed, inject } from '@angular/core';
import { DashboardService } from '../../../../services/dashboard.service';
import { transformSalesSummary, SalesSummary } from '../../../../utils/sales-summary.util';

export class SalesSummaryStore {
  private readonly dashboardService = inject(DashboardService);

  private _organizationId = signal<string | null>(null);
  private _startDate = signal<string | null>(null);
  private _endDate = signal<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);
  summaryData = signal<SalesSummary | null>(null);

  graphData = computed(() => this.summaryData()?.graphData ?? []);
  summaryItems = computed(() => this.summaryData()?.summaryItems ?? []);

  setOrganizationId(id: string) {
    this._organizationId.set(id);
  }

  setDateRange(start: string | null, end: string | null) {
    this._startDate.set(start);
    this._endDate.set(end);
  }

  reset() {
    this.summaryData.set(null);
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
        this.summaryData.set(transformSalesSummary(res.data));
      } else {
        this.error.set(res?.message ?? 'No data available');
        this.summaryData.set(null);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to fetch sales summary');
      this.summaryData.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }
}
