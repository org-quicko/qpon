import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  AfterViewInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { OrganizationStore } from '../../../store/organization.store';
import { CouponsStore } from '../../../store/coupons.store';
import { CustomDatePipe } from '../../../pipe/date.pipe';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { CouponDto, CreateCouponDto, UpdateCouponDto } from '../../../../dtos/coupon.dto';
import { MatDividerModule } from '@angular/material/divider';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CouponFilter } from '../../../types/coupon-filter.interface';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PaginationOptions } from '../../../types/PaginatedOptions';
import { sortOrderEnum } from '../../../../enums';
import { CouponFilterDialogComponent } from './coupon-filter-dialog/coupon-filter-dialog.component';
import { FiltersStore } from '../../../store/filters.store';
import { UserAbility, UserAbilityTuple } from '../../../permissions/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { PureAbility } from '@casl/ability';
import { NotAllowedDialogBoxComponent } from '../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
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
export class CouponsComponent implements OnInit {
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
  isFilterApplied: boolean = false;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  filter = signal<CouponFilter | null>(null);

  sortOptions = signal<{ active: 'createdAt'; direction: 'asc' | 'desc' }>({
    active: 'createdAt',
    direction: 'desc',
  });

  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });

  couponDatasource = new MatTableDataSource<CouponDto | number>();

  couponsStore = inject(CouponsStore);
  organizationStore = inject(OrganizationStore);
  readonly dialog = inject(MatDialog);
  filtersStore = inject(FiltersStore);

  organization = this.organizationStore.organizaiton;
  isLoading = this.couponsStore.isLoading;
  coupons = this.couponsStore.coupons;
  count = this.couponsStore.count!;
  take = this.couponsStore.take!;
  skip = this.couponsStore.skip!;
  couponFilter = this.filtersStore.couponFilter;

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.formBuilder.group<CouponFilter>({
      status: null,
      discountType: null,
      itemConstraint: null,
    });

    this.isFilterApplied = false;

    // Update datasource when coupons change
    effect(() => {
      if (this.isLoading()) {
        this.couponDatasource.data = this.tempDatasource;
        return;
      }

      const coupons = this.coupons();

      if (!coupons || coupons.length === 0) {
        this.couponDatasource.data = [];
        return;
      }

      const { pageIndex, pageSize } = this.paginationOptions();
      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, coupons.length);

      this.couponDatasource.data = coupons.slice(start, end);
    });

    effect(() => {
      if(this.couponFilter()) {
        this.filter.set({
          ...this.couponFilter()
        })
      }
    })
  }

  ngOnInit(): void {
    this.couponsStore.resetCoupons();
    this.couponsStore.resetLoadedPages();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((name) => {
        this.isFilterApplied = true;
        this.filter.set({
          ...this.filter(),
          query: name?.trim()
        });
        this.couponsStore.fetchCoupons({
          organizationId: this.organization()?.organizationId!,
          filter: {
            ...this.filter(),
          },
          isFilterOperation: true
        });
      });

      this.route.queryParams.subscribe((queryParams) => {
        const mergedFilter: CouponFilter = queryParams
    
        this.filter.set(mergedFilter);

        this.couponsStore.resetLoadedPages();
        this.couponsStore.fetchCoupons({
          organizationId: this.organization()?.organizationId!,
          filter: mergedFilter,
          sortOptions: {
            sortBy: this.sortOptions().active,
            sortOrder: this.sortOptions().direction == 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC
          },
          isFilterOperation: true
        });
      });
  }

  openDialog(coupon: CouponDto) {
    if(this.can('update', UpdateCouponDto)) {
      this.dialog.open(ChangeStatusComponent, {
        data: {
          coupon,
          organizationId: this.organization()?.organizationId,
          activateCoupon: this.couponsStore.activateCoupon,
          deactivateCoupon: this.couponsStore.deactivateCoupon,
        },
        autoFocus: false,
      });
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({ pageIndex: event.pageIndex, pageSize: event.pageSize });
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
      filter: this.filter()!,
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

  onRowClick(coupon: CouponDto) {
    this.router.navigate([`../coupons/${coupon.couponId}`], {
      relativeTo: this.route,
    });
  }

  onSortChange(event: Sort) {
    // sorting logic
    this.paginationOptions.set({ pageIndex: 0, pageSize: 10 });

    this.sortOptions.set({
      active: 'createdAt',
      direction: event.direction as 'asc' | 'desc'
    })

    // this.router.navigate([], {
    //   queryParams: {
    //     'sort_by': this.sortOptions().active,
    //     'sort_order': this.sortOptions().direction == 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC,
    //   },
    //   queryParamsHandling: 'merge'
    // })

    this.couponsStore.resetLoadedPages();

    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      skip: this.paginationOptions().pageIndex * this.paginationOptions().pageSize,
      take: this.paginationOptions().pageSize,
      filter: this.filter()!,
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder: this.sortOptions().direction == 'asc' ? sortOrderEnum.ASC : sortOrderEnum.DESC
      },
      isSortOperation: true,
    });
  }

  onAddCoupon() {
    if(this.can('create', CreateCouponDto)) {
      this.router.navigate(['../../coupons/create'], { relativeTo: this.route });
    } else {
      const rule = this.ability.relevantRuleFor('create', CreateCouponDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openNotAllowedDialogBox(restrictionReason: string) {
		this.dialog.open(NotAllowedDialogBoxComponent, {
			data: {
				description: restrictionReason,
			}
		});
	}

  openFilterDialog() {
    const dialogRef = this.dialog.open(CouponFilterDialogComponent, {
      autoFocus: false,
      data: { couponFilter: this.filter() },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((params: CouponFilter) => {
        this.isFilterApplied = true;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: params,
        });
      });
  }

  onEdit(couponId: string) {
    if(this.can('update', UpdateCouponDto)) {
      this.router.navigate(
        [`/${this.organization()?.organizationId}/coupons/${couponId}/edit`],
        {
          queryParams: {
            redirect: btoa(this.router.url),
          },
        }
      );
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }
}
