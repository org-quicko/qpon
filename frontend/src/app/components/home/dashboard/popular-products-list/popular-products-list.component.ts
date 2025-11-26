import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { DateRangeFilterComponent } from "../../../../layouts/range-selector/date-range-filter.component";
import { OrganizationStore } from '../../../../store/organization.store';
import { ItemSummaryStore } from '../store/item-summary.store';
import { DateRangeStore } from '../../../../store/date-range.store';
import { MatCard } from "@angular/material/card";
import { NgIf, NgForOf } from '@angular/common';
import { NgxSkeletonLoaderComponent } from "ngx-skeleton-loader";

@Component({
  selector: 'app-popular-products-list',
  templateUrl: './popular-products-list.component.html',
  styleUrls: ['./popular-products-list.component.css'],
  imports: [MatIcon, DateRangeFilterComponent, MatCard, NgIf, NgForOf, NgxSkeletonLoaderComponent],
  providers: [ItemSummaryStore]
})
export class PopularProductsListComponent {

  organizationsStore = inject(OrganizationStore);
  itemSummaryStore = inject(ItemSummaryStore);
  dateRangeStore = inject(DateRangeStore);

  labelColumn = 'Products';
  valueColumn = 'Redemptions';

  constructor(private router: Router) {

    effect(() => {
      this.fetchData();
    });
  }

  ngOnInit() {
  }

  // Chart data accessor
  get chartData() {
    return this.itemSummaryStore.popularityData() ?? [];
  }

  // Max value for width calculation
  get maxValue() {
    return this.chartData.length > 0
      ? Math.max(...this.chartData.map(d => d.value))
      : 0;
  }

  get isLoading() {
    return this.itemSummaryStore.isLoading();
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

    this.itemSummaryStore.fetchItemSummary({
      organizationId: orgId,
      startDate: startStr,
      endDate: endStr,
    });
  }
}
