import {
  AfterViewChecked,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
  computed,
  DestroyRef,
  inject as injectDI,
  AfterViewInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { OrganizationStore } from '../../../store/organization.store';
import { CouponsStore } from '../../../store/coupons.store';
import { CustomDatePipe } from '../../../pipe/date.pipe';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { CouponDto } from '../../../../dtos/coupon.dto';
import { MatDividerModule } from '@angular/material/divider';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CouponFilter } from '../../../types/coupon-filter.interface';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [
    MatRippleModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatDialogModule,
    MatRadioModule,
    MatDividerModule,
    MatSortModule,
    CustomDatePipe,
    CommonModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.html',
})
export class CouponsComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  columns = [
    'name',
    'discount',
    'applicable_on',
    'status',
    'createdAt',
    'menu',
  ];
  filterForm: FormGroup;
  searchControl = new FormControl('');
  overlayRef!: OverlayRef;
  sort!: MatSort;
  isFilterApplied: boolean = false;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  sortActive = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  couponDatasource = new MatTableDataSource<CouponDto | number>();

  couponsStore = inject(CouponsStore);
  organizationStore = inject(OrganizationStore);
  readonly dialog = inject(MatDialog);
  private destroyRef = injectDI(DestroyRef);

  organization = this.organizationStore.organizaiton;
  isLoading = this.couponsStore.isLoading;
  coupons = this.couponsStore.coupons;
  count = this.couponsStore.count!;
  take = this.couponsStore.take!;
  skip = this.couponsStore.skip!;

  // Computed property for pageIndex
  pageIndex = computed(() => {
    return this.skip() && this.take()
      ? Math.floor(this.skip()! / this.take()!)
      : 0;
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (ms) {
      this.sort = ms;
      this.couponDatasource.sort = ms;
    }
  }

  @ViewChild('matMenu') matMenuTrigger!: MatMenuTrigger;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.formBuilder.group<CouponFilter>({
      couponStatus: null,
      discountType: null,
      itemConstraint: null,
    });

    this.isFilterApplied = false;

    // Update datasource when coupons change
    effect(() => {
      this.couponDatasource.data = this.isLoading()
        ? this.tempDatasource
        : this.coupons() ?? [];
    });
  }

  ngOnInit(): void {
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((name) => {
        this.isFilterApplied = true;
        this.couponsStore.fetchCoupons({
          organizationId: this.organization()?.organizationId!,
          filter: {
            query: name?.trim(),
          },
        });
      });
  }

  ngAfterViewChecked(): void {
    // **Ensure MatSort is available before initializing**
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.couponDatasource.sort = this.sort;
      this.couponDatasource.sort.sortChange.subscribe(() => {
        this.paginator.pageIndex = 0; // Reset pagination on sort change
      });
    }
  }

  openDialog(coupon: CouponDto) {
    this.dialog.open(ChangeStatusComponent, {
      data: {
        coupon,
        organizationId: this.organization()?.organizationId,
        activateCoupon: this.couponsStore.activateCoupon,
        deactivateCoupon: this.couponsStore.deactivateCoupon,
      },
      autoFocus: false,
    });
  }

  onPageChange(event: PageEvent) {
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: event.pageSize,
    });
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  resetForm() {
    this.filterForm.reset();
    this.couponsStore.resetFilter();

    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
    });
  }

  applyFilters() {
    this.isFilterApplied = true;
    if (this.couponDatasource.paginator) {
      this.couponDatasource.paginator.firstPage();
    }

    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      filter: this.filterForm.value,
    });
  }

  onRowClick(coupon: CouponDto) {
    this.router.navigate([`../coupons/${coupon.couponId}`], {
      relativeTo: this.route,
    });
  }

  onSortChange(event: Sort) {

    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction as 'asc' | 'desc');

    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      filter: { ...this.filterForm.value, sortBy: event.active, sortOrder: event.direction },
      isSortOperation: true,
    });
  }
}