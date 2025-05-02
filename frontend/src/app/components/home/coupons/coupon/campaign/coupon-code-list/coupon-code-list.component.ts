import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  effect,
  inject,
  Input,
  OnInit,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';
import { CouponCodeDto } from '../../../../../../../dtos/coupon-code.dto';
import { CouponCodesStore } from './store/coupon-codes.store';
import { OrganizationStore } from '../../../../../../store/organization.store';
import {
  formatDate,
  NgClass,
  NgFor,
  NgIf,
  NgStyle,
  TitleCasePipe,
} from '@angular/common';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SnackbarService } from '../../../../../../services/snackbar.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { CouponCodeChangeStatusDialogComponent } from './coupon-code-change-status-dialog/coupon-code-change-status.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { sortOrderEnum } from '../../../../../../../enums';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { FiltersStore } from '../../../../../../store/filters.store';
import { CouponCodeFilter } from '../../../../../../types/coupon-code-filter.interface';
import { PaginationOptions } from '../../../../../../types/PaginatedOptions';
import { CampaignsStore } from '../../coupon-tab/campaigns/store/campaigns.store';
import { CampaignSummaryRow } from '../../../../../../../generated/sources/campaign_summary_workbook';
import { InactiveMessageDialogComponent } from '../../../../common/inactive-message-dialog/inactive-message-dialog.component';

@Component({
  selector: 'app-coupon-code-list',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    NgClass,
    CustomDatePipe,
    TitleCasePipe,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule,
  ],
  providers: [CouponCodesStore],
  templateUrl: './coupon-code-list.component.html',
  styleUrls: ['./coupon-code-list.component.css'],
})
export class CouponCodeListComponent implements OnInit {
  @Input() campaign!: Signal<CampaignSummaryRow | null>;

  couponId: string;
  campaignId: string;
  searchControl: FormControl;
  copiedField: string | null = null;
  sort!: MatSort;
  filter = signal<CouponCodeFilter | null>(null);
  couponCodeFilter!: Signal<CouponCodeFilter | null>;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  sortActive = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  columns = [
    'name',
    'visibility',
    'expires_at',
    'redemption_count',
    'max_redemptions',
    'status',
    'createdAt',
    'menu',
  ];
  datasource = new MatTableDataSource<CouponCodeDto>();

  couponCodesStore = inject(CouponCodesStore);
  organizationStore = inject(OrganizationStore);
  filtersStore = inject(FiltersStore);
  snackbarService = inject(SnackbarService);
  readonly dialog = inject(MatDialog);

  couponCodes = this.couponCodesStore.couponCodes;
  count = this.couponCodesStore.count!;
  organization = this.organizationStore.organizaiton;
  isLoading = this.couponCodesStore.isLoading;
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10
  })

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';

    this.searchControl = new FormControl('');

    effect(() => {
      const couponCodes = this.couponCodes() ?? [];

      const { pageIndex, pageSize } = this.paginationOptions();
      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, couponCodes.length);

      this.datasource.data = couponCodes.slice(start, end);

      this.couponCodeFilter = this.filtersStore.couponCodesFilter;
    });
  }

  ngOnInit() {
    this.couponCodesStore.resetLoadedPages();
    this.couponCodesStore.resetCouponCodes();

    this.route.params.pipe(take(1)).subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
    });

    this.route.queryParams.subscribe((queryParams) => {
      this.filter.set(Object.assign({}, queryParams));
      this.couponCodesStore.resetLoadedPages();

      this.couponCodesStore.fetchCouponCodes({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        campaignId: this.campaignId,
        filter: this.filter()!,
        sortOptions: {
          sortBy: this.sortActive(),
          sortOrder: this.sortDirection() == 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC
        },
        isFilterOperation: true
      });
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((code: string) => {
        this.couponCodesStore.fetchCouponCodes({
          organizationId: this.organization()?.organizationId!,
          couponId: this.couponId,
          campaignId: this.campaignId,
          filter: { query: code.trim() },
          isFilterOperation: true
        });
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

  openChangeStatusDialog(couponCode: CouponCodeDto) {
    this.dialog.open(CouponCodeChangeStatusDialogComponent, {
      data: {
        couponCode,
        campaignId: this.campaignId,
        couponId: this.couponId,
        organizationId: this.organization()?.organizationId,
        activateCouponCode: this.couponCodesStore.activateCouponCode,
        deactivateCouponCode: this.couponCodesStore.deactivateCouponCode,
      },
      autoFocus: false,
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: 10
    })

    this.couponCodesStore.fetchCouponCodes({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      campaignId: this.campaignId,
      skip: event.pageIndex * event.pageSize,
      take: event.pageSize,
      filter: this.filter()!,
    });
  }

  onSortChange(event: Sort) {
    if (this.couponCodes()?.length == 0) {
      return;
    }

    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction as 'asc' | 'desc');

    this.paginationOptions.set({
      pageIndex: 0,
      pageSize: 10
    });

    this.couponCodesStore.resetLoadedPages();

    this.couponCodesStore.fetchCouponCodes({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      campaignId: this.campaignId,
      filter: {
        ...this.couponCodeFilter(),
      },
      sortOptions: {
        sortBy: event.active,
        sortOrder:
          event.direction == 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC,
      },
      isSortOperation: true,
    });
  }

  openFilterDialog() {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      autoFocus: false,
      data: { couponCodeFilter: this.filter() },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((params: CouponCodeFilter) => {
        this.paginationOptions.set({
          pageIndex: 0,
          pageSize: 10
        })
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: params,
        });
      });
  }

  onRowClick(couponCode: CouponCodeDto) {
    this.router.navigate(['./coupon-codes', couponCode.couponCodeId], {
      relativeTo: this.route,
    });
  }

  onCreateCouponCode() {
    this.router.navigate([
      `/${this.organization()?.organizationId}/coupons/${
        this.couponId
      }/campaigns/${this.campaignId}/coupon-codes/create`,
    ], {
      queryParams: {
        'redirect': btoa(this.router.url)
      }
    });
  }

  onEdit(couponCode: CouponCodeDto) {
    this.router.navigate([
      `/${this.organization()?.organizationId}/coupons/${
        this.couponId
      }/campaigns/${this.campaignId}/coupon-codes/${couponCode.couponCodeId}/edit/code-details`,
    ]);
  }

  openInactiveMessageDialogForCouponCode() {
    this.dialog.open(InactiveMessageDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Campaign inactive!',
        description: 'You can’t create coupon code because the campaign is marked inactive.'
      }
    })
  }

  openInvactiveMessageDialogForChangeStatus() {
      this.dialog.open(InactiveMessageDialogComponent, {
        autoFocus: false,
        data: {
          title: 'Campaign inactive!',
          description: 'You can’t mark this coupon code as active because the campaign is marked inactive.'
        }
      })
    }
}
