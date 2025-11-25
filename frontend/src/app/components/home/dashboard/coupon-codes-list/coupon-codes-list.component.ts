import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { DateRangeFilterComponent } from "../../../../layouts/range-selector/date-range-filter.component";
import { OrganizationStore } from '../../../../store/organization.store';
import { CouponCodeSummaryStore } from '../store/coupon-code-summary.store';
import { DateRangeStore } from '../../../../store/date-range.store';
import { MatCard } from "@angular/material/card";
import { NgIf, NgForOf } from '@angular/common';
import { NgxSkeletonLoaderComponent } from "ngx-skeleton-loader";

@Component({
  selector: 'app-coupon-codes-list',
  templateUrl: './coupon-codes-list.component.html',
  styleUrls: ['./coupon-codes-list.component.css'],
  imports: [MatIcon, DateRangeFilterComponent, MatCard, NgIf, NgForOf, NgxSkeletonLoaderComponent],
  providers: [CouponCodeSummaryStore]
})
export class CouponCodesListComponent {

  organizationsStore = inject(OrganizationStore);
  couponCodesStore = inject(CouponCodeSummaryStore);
  dateRangeStore = inject(DateRangeStore);

  labelColumn = 'Codes';
  valueColumn = 'Redemptions';

  constructor(private router: Router) {

    // Auto-fetch whenever date range changes
    effect(() => {
      const start = this.dateRangeStore.start();
      const end = this.dateRangeStore.end();

      if (start && end) {
        this.fetchData();
      }
    });
  }

  ngOnInit() {
    this.fetchData(); // initial load
  }

  // Chart data accessor
  get chartData() {
    return this.couponCodesStore.popularityData() ?? [];
  }

  // Max value for width calculation
  get maxValue() {
    return this.chartData.length > 0
      ? Math.max(...this.chartData.map(d => d.value))
      : 0;
  }

  get isLoading() {
    return this.couponCodesStore.isLoading();
  }

  // Navigate back
  onNavigateToDashboard() {
    const id = this.organizationsStore.organizaiton()?.organizationId;
    this.router.navigate([`/${id}/home/dashboard`]);
  }

  // Fetch summary data
  private fetchData() {
    const orgId = this.organizationsStore.organizaiton()?.organizationId;
    if (!orgId) return;

    const start = this.dateRangeStore.start();
    const end = this.dateRangeStore.end();

    const startStr = start ? start.toISOString().split("T")[0] : undefined;
    const endStr = end ? end.toISOString().split("T")[0] : undefined;

    this.couponCodesStore.fetchCouponCodeSummary({
      organizationId: orgId,
      startDate: startStr,
      endDate: endStr,
      take: 30
    });
  }
}
