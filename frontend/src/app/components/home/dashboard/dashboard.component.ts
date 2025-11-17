import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TitleCasePipe, NgIf, CommonModule } from '@angular/common';
import { DashboardSalesAnalyticsComponent } from './sales-analytics/sales-analytics.component';
import { PopularityChartComponent } from '../../common/popularity-chart/popularity-chart.component';
import { SalesTrendChartComponent } from './sales-chart/sales-trend-chart.component';

import { UserStore } from '../../../store/user.store';
import { OrganizationStore } from '../../../store/organization.store';
import { SalesSummaryStore } from './store/sales-summary.store';
import { ItemSummaryStore } from './store/item-summary.store';
import { CouponCodeSummaryStore } from './store/coupon-code-summary.store';
import { DateRangeStore } from '../../../store/date-range.store';
import { RedemptionListComponent } from "./recent-redemption-list/redemption-list.component";
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { RedemptionsStore } from './recent-redemption-list/store/redemptions.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    TitleCasePipe,
    NgIf,
    DashboardSalesAnalyticsComponent,
    PopularityChartComponent,
    SalesTrendChartComponent,
    RedemptionListComponent,
    CommonModule,
    NgxSkeletonLoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [
    SalesSummaryStore,
    ItemSummaryStore,
    CouponCodeSummaryStore,
    RedemptionsStore
  ],
})
export class DashboardComponent implements OnInit {
  // Inject stores
  private userStore = inject(UserStore);
  private organizationStore = inject(OrganizationStore);
  private salesSummaryStore = inject(SalesSummaryStore);
  private itemSummaryStore = inject(ItemSummaryStore);
  private couponCodeSummaryStore = inject(CouponCodeSummaryStore);
  public dateRangeStore = inject(DateRangeStore);
  private redemptionsStore = inject(RedemptionsStore);

  // For infinite-loop prevention
  private lastOrgId: string | null = null;
  private lastStart: string | null = null;
  private lastEnd: string | null = null;

  // Derived signals
  user = this.userStore.user;
  organization = this.organizationStore.organizaiton;
  dateLabel = this.dateRangeStore.label;
  formattedRange = this.dateRangeStore.formattedRange;
  salesLoading = this.salesSummaryStore.isLoading;
  itemLoading = this.itemSummaryStore.isLoading;
  couponLoading = this.couponCodeSummaryStore.isLoading;
  error = this.salesSummaryStore.error;

  // aggregated totals
  summaryTotals = computed(() => {
    const items = this.salesSummaryStore.summaryItems();
    if (!items?.length) return null;

    const findValue = (key: string) =>
      Number(items.find((i) => i.key === key)?.value ?? 0);

    return {
      totalRedemptions: findValue('total_redemptions'),
      grossSalesAmount: findValue('gross_sales_amount'),
      discountAmount: findValue('discount_amount'),
      discountPercentage: findValue('discount_percentage'),
      netSalesAmount: findValue('net_sales_amount'),
    };
  });

  stats = computed(() => {
    const totals = this.summaryTotals();
    return {
      totalRedemptions: totals?.totalRedemptions ?? 0,
      grossSales: totals?.grossSalesAmount ?? 0,
      discount: totals?.discountAmount ?? 0,
      discountPercent: totals?.discountPercentage ?? 0,
      netSales: totals?.netSalesAmount ?? 0,
    };
  });

  graphData = computed(() => this.salesSummaryStore.graphData());
  itemPopularityData = this.itemSummaryStore.popularityData;
  couponPopularityData = this.couponCodeSummaryStore.popularityData;

  constructor() {
    effect(() => {
      const org = this.organization();
      const orgId = org?.organizationId;
      if (!orgId) return;

      const start = this.dateRangeStore.start();
      const end = this.dateRangeStore.end();

      const startStr = start ? start.toISOString().split('T')[0] : null;
      const endStr = end ? end.toISOString().split('T')[0] : null;

      // Prevent infinite loops
      if (
        this.lastOrgId === orgId &&
        this.lastStart === startStr &&
        this.lastEnd === endStr
      ) {
        return;
      }

      // update reference
      this.lastOrgId = orgId;
      this.lastStart = startStr;
      this.lastEnd = endStr;

      // run fetch
      this.fetchAllData(orgId, start, end);
    });
  }

  ngOnInit() {
    this.dateRangeStore.reset();
  }
  /** Fetch all dashboard data */
  private fetchAllData(orgId: string, start: Date | null, end: Date | null) {
    const startStr = start ? start.toISOString().split('T')[0] : undefined;
    const endStr = end ? end.toISOString().split('T')[0] : undefined;

    // sales
    this.salesSummaryStore.setOrganizationId(orgId);
    this.salesSummaryStore.setDateRange(startStr ?? null, endStr ?? null);
    this.salesSummaryStore.fetchSalesSummary();

    // item
    this.itemSummaryStore.fetchItemSummary({
      organizationId: orgId,
      startDate: startStr,
      endDate: endStr,
    });

    // coupon
    this.couponCodeSummaryStore.fetchCouponCodeSummary({
      organizationId: orgId,
      startDate: startStr,
      endDate: endStr,
    });

    this.redemptionsStore.resetRedemptionsState();
    this.redemptionsStore.fetchRedemptions({
      organizationId: orgId,
      skip: 0,
      take: 5,
      from: startStr,
      to: endStr,
    });
  }
}
