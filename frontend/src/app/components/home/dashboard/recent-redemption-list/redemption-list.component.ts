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
import { ActivatedRoute, Params } from '@angular/router';
import { OrganizationStore } from '../../../../store/organization.store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PaginationOptions } from '../../../../types/PaginatedOptions';
import { sortOrderEnum } from '../../../../../enums';
import { SnackbarService } from '../../../../services/snackbar.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recent-redemption-list',
  imports: [
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule,
    DatePipe,
    NgxSkeletonLoaderModule,
],
  providers: [RedemptionsStore],
  templateUrl: './redemption-list.component.html',
  styleUrls: ['./redemption-list.component.css'],
})
export class RedemptionListComponent implements OnInit {
  columns = ['appliedAt', 'customer', 'coupon', 'item', 'sales', 'discount'];
  searchControl: FormControl;
  couponId: string;
  campaignId: string;
  couponCodeId: string;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
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

  redemptions = this.redemptionsStore.redemptions;
  isLoading = this.redemptionsStore.isLoading;
  organization = this.organizationsStore.organizaiton;
  count = this.redemptionsStore.count;
  copiedField: string | null = null;

  datasource = new MatTableDataSource<RedemptionRow | number>();

  constructor(private route: ActivatedRoute) {
    this.searchControl = new FormControl('');
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
    this.isFilterApplied = false;

    effect(() => {
      if (this.isLoading()) {
        this.datasource.data = this.tempDatasource;
        return;
      }

      const redemptions = this.redemptions() ?? [];

      const { pageIndex, pageSize } = this.paginationOptions();
      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, redemptions.length);

      this.datasource.data = redemptions.slice(start, end);
    });
  }

  ngOnInit(): void {
    this.redemptionsStore.resetLoadedPages();

    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.isFilterApplied = true;

        this.redemptionsStore.fetchRedemptions({
          organizationId: this.organization()?.organizationId!,
          filter: { email: value.trim() },
        });
      });

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organization()?.organizationId!,
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organization()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
    });
  }

  copyToClipboard(value: string, field: string) {
    navigator.clipboard.writeText(value).then(() => {
      this.snackbarService.openSnackBar('Copied ' + field, undefined);
      this.copiedField = field;
      setTimeout(() => {
        this.copiedField = null;
      }, 2000);
    });
  }

  onSortChange(event: Sort) {
    this.paginationOptions.set({
      pageIndex: 0,
      pageSize: 10,
    });

    this.sortOptions.set({
      active: 'createdAt',
      direction: event.direction as 'asc' | 'desc',
    });

    this.redemptionsStore.resetLoadedPages();

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organization()?.organizationId!,
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
      isSortOperation: true,
    });
  }
}
