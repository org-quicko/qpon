import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RedemptionRow } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { RedemptionsStore } from './store/redemptions.store';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../../store/organization.store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PaginationOptions } from '../../../../types/PaginatedOptions';
import { sortOrderEnum } from '../../../../../enums';
import { SnackbarService } from '../../../../services/snackbar.service';
import { DateRangeFilterComponent } from "../../../../layouts/range-selector/date-range-filter.component";
import { DateRangeStore } from '../../../../store/date-range.store';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'dashboard-redemption-list',
  imports: [
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    DateRangeFilterComponent,
    DatePipe,
    CurrencyPipe,
  ],
  providers: [RedemptionsStore],
  templateUrl: './redemption-list.component.html',
  styleUrls: ['./redemption-list.component.css'],
})
export class RedemptionListComponent implements OnInit {

  columns = ['appliedAt', 'customer', 'coupon', 'item', 'sales', 'discount'];
  searchControl = new FormControl('');
  isFilterApplied: boolean = false;

  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });

  sortOptions = signal<{ active: 'createdAt'; direction: 'asc' | 'desc' }>({
    active: 'createdAt',
    direction: 'desc',
  });

  redemptionsStore = inject(RedemptionsStore);
  organizationsStore = inject(OrganizationStore);
  snackbarService = inject(SnackbarService);
  router = inject(Router);
  dateRangeStore = inject(DateRangeStore);

  redemptions = this.redemptionsStore.redemptions;
  isLoading = this.redemptionsStore.isLoading;
  count = this.redemptionsStore.count;
  organization = this.organizationsStore.organizaiton;

  datasource = new MatTableDataSource<RedemptionRow | number>();
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  copiedField: string | null = null;

  constructor() {

    // Auto update table data
    effect(() => {
      if (this.isLoading()) {
        this.datasource.data = this.tempDatasource;
        return;
      }

      const list = this.redemptions() ?? [];
      const { pageIndex, pageSize } = this.paginationOptions();
      const start = pageIndex * pageSize;
      const end = start + pageSize;

      this.datasource.data = list.slice(start, end);
    });

    // Auto fetch when date range changes
    effect(() => {
      const start = this.dateRangeStore.start();
      const end = this.dateRangeStore.end();

      this.redemptionsStore.resetStore();
      this.paginationOptions.set({ pageIndex: 0, pageSize: 10 });

      this.redemptionsStore.fetchRedemptions({
        organizationId: this.organizationsStore.organizaiton()?.organizationId!,
        sortOptions: {
          sortBy: this.sortOptions().active,
          sortOrder: this.sortOptions().direction === 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
        },
        from: start ? start.toISOString() : undefined,
        to: end ? end.toISOString() : undefined,
      });

    });
  }

  ngOnInit(): void {

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {

        const email = (value ?? '').trim();
        this.isFilterApplied = true;

        this.paginationOptions.set({ pageIndex: 0, pageSize: 10 });
        this.redemptionsStore.resetLoadedPages();

        this.redemptionsStore.fetchRedemptions({
          organizationId: this.organizationsStore.organizaiton()?.organizationId!,
          filter: { email },
          from: this.dateRangeStore.start()?.toISOString(),
          to: this.dateRangeStore.end()?.toISOString(),
        });
      });

  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organizationsStore.organizaiton()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: event.pageSize,
      from: this.dateRangeStore.start()?.toISOString(),
      to: this.dateRangeStore.end()?.toISOString(),
    });
  }

  onSortChange(event: Sort) {

    this.paginationOptions.set({ pageIndex: 0, pageSize: 10 });

    this.sortOptions.set({
      active: 'createdAt',
      direction: event.direction as 'asc' | 'desc',
    });

    this.redemptionsStore.resetLoadedPages();

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organizationsStore.organizaiton()?.organizationId!,
      isSortOperation: true,
      sortOptions: {
        sortBy: 'createdAt',
        sortOrder:
          event.direction === 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC,
      },
      from: this.dateRangeStore.start()?.toISOString(),
      to: this.dateRangeStore.end()?.toISOString(),
    });
  }

  onNavigateToDashboard() {
    const id = this.organizationsStore.organizaiton()?.organizationId;
    this.router.navigate([`/${id}/home/dashboard`]);
  }

  copyToClipboard(value: string, field: string) {
    navigator.clipboard.writeText(value).then(() => {
      this.snackbarService.openSnackBar(`Copied ${field}`, undefined);
      this.copiedField = field;
      setTimeout(() => (this.copiedField = null), 2000);
    });
  }
}
