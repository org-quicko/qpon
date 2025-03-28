import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { CurrencyPipe, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { OrganizationStore } from '../../../store/organization.store';
import { CouponsStore } from './store/coupons.store';
import { DatePipe } from '../../../pipe/date.pipe';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { CouponDto } from '../../../../dtos/coupon.dto';
import { MatDividerModule } from '@angular/material/divider';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CouponFilter } from '../../../interfaces/coupon-filter.interface';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { sortOrderEnum } from '../../../../enums';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-coupons',
  imports: [
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
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    NgClass,
    ReactiveFormsModule,
  ],
  providers: [CouponsStore],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.html',
})
export class CouponsComponent implements OnInit, AfterViewChecked {
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

  couponDatasource = new MatTableDataSource<CouponDto>();

  couponsStore = inject(CouponsStore);
  organizationStore = inject(OrganizationStore);
  readonly dialog = inject(MatDialog);

  organization = this.organizationStore.organizaiton;
  isLoading = this.couponsStore.isLoading;
  coupons = this.couponsStore.filteredCoupons;
  count = this.couponsStore.count!;
  take = this.couponsStore.take!;
  skip = this.couponsStore.skip!;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // **Signal for Sort State**
  sortState = signal<{ sortBy: string | null; sortOrder: sortOrderEnum }>({
    sortBy: null,
    sortOrder: sortOrderEnum.ASC,
  });

  private isSortInitialized = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.filterForm = this.formBuilder.group<CouponFilter>({
      couponStatus: null,
      discountType: null,
      itemConstraint: null,
    });

    // **Effect to reactively fetch data when sorting changes**
    effect(() => {
      const { sortBy, sortOrder } = this.sortState();
      if (sortBy) {
        this.couponsStore.fetchCouponsByFilter({
          organizationId: this.organization()?.organizationId!,
          filter: { ...this.filterForm.value, sortBy, sortOrder },
        });
      }
    });
  }

  ngOnInit(): void {
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((name) => {
      this.couponsStore.fetchCouponsByFilter({
        organizationId: this.organization()?.organizationId!,
        filter: {
          query: name
        }
      });
    })
  }

  ngAfterViewChecked(): void {
    // **Ensure MatSort is available before initializing**
    if (this.sort && !this.isSortInitialized) {
      this.couponDatasource.sort = this.sort;
      this.sort.sortChange.subscribe(() => {
        this.paginator.pageIndex = 0; // Reset pagination on sort change
        this.sortState.set({
          sortBy: this.sort.active,
          sortOrder:
            this.sort.direction === 'asc'
              ? sortOrderEnum.ASC
              : sortOrderEnum.DESC,
        });
      });
      this.isSortInitialized = true;
    }
  }

  openDialog(coupon: CouponDto) {
    this.dialog.open(ChangeStatusComponent, {
      data: { coupon, organizationId: this.organization()?.organizationId },
      autoFocus: false,
    });
  }

  onPageChange(event: PageEvent) {
    this.couponsStore.fetchCouponsByFilter({
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
  }

  applyFilters() {
    if (this.couponDatasource.paginator) {
      this.couponDatasource.paginator.firstPage();
    }

    this.couponsStore.fetchCouponsByFilter({
      organizationId: this.organization()?.organizationId!,
      filter: this.filterForm.value,
    });
  }

  onRowClick(coupon: CouponDto) {
    this.router.navigate([`../coupon/${coupon.couponId}`], { relativeTo: this.route })
  }
}
