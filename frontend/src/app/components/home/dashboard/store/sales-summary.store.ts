import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DashboardService } from '../../../../services/dashboard.service';
import { plainToInstance, Type } from 'class-transformer';

class SalesSummaryRow {
  date!: string;
  grossSalesAmount!: number;
  discountAmount!: number;
  netSalesAmount!: number;
}

class SalesSummaryItem {
  key!: string;
  value!: number | string;
}

class SalesSummaryWorkbook {
  @Type(() => SalesSummaryRow)
  graphData: SalesSummaryRow[] = [];

  @Type(() => SalesSummaryItem)
  summaryItems: SalesSummaryItem[] = [];

  static fromApi(data: any): SalesSummaryWorkbook {
    const workbook = new SalesSummaryWorkbook();

    try {
      const sheet = data?.sheets?.[0];
      if (!sheet) return workbook;

      const graphBlock = sheet.blocks?.[0];
      if (graphBlock?.rows) {
        workbook.graphData = graphBlock.rows.map((r: any[]) => ({
          date: r[0],
          grossSalesAmount: +r[1] || 0,
          discountAmount: +r[2] || 0,
          netSalesAmount: +r[3] || 0,
        }));
      }

      const summaryBlock = sheet.blocks?.[1];
      if (summaryBlock?.items) {
        workbook.summaryItems = summaryBlock.items.map((i: any) => ({
          key: i.key,
          value: i.value,
        }));
      }

      return plainToInstance(SalesSummaryWorkbook, workbook);
    } catch (e) {
      console.error('❌ Failed to transform workbook:', e);
      return workbook;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class SalesSummaryStore {
  private readonly dashboardService = inject(DashboardService);

  // --- signals ---
  private _organizationId = signal<string | null>(null);
  private _startDate = signal<string | null>(null);
  private _endDate = signal<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);
  workbook = signal<SalesSummaryWorkbook | null>(null);

  // --- computed ---
  organizationId = computed(() => this._organizationId());
  startDate = computed(() => this._startDate());
  endDate = computed(() => this._endDate());
  hasData = computed(() => !!this.workbook());
  graphData = computed(() => this.workbook()?.graphData ?? []);
  summaryItems = computed(() => this.workbook()?.summaryItems ?? []);

  // --- setters ---
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

  // --- main action ---
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
        this.workbook.set(SalesSummaryWorkbook.fromApi(res.data));
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
