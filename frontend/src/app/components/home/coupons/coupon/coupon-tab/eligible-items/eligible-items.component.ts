import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CouponStore } from '../../store/coupon.store';
import { EligibleItemsStore, OnEligibleItemsSuccess } from './store/eligible-items.store';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ItemDto } from '../../../../../../../dtos/item.dto';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { NgFor, NgStyle } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginationOptions } from '../../../../../../types/PaginatedOptions';
import { MatDialog } from '@angular/material/dialog';
import { NotAllowedDialogBoxComponent } from '../../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { UserAbility, UserAbilityTuple } from '../../../../../../permissions/ability';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { CouponItemDto, CreateCouponItemDto } from '../../../../../../../dtos/coupon-item.dto';

@Component({
  selector: 'app-eligible-items',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule,
  ],
  providers: [EligibleItemsStore],
  templateUrl: './eligible-items.component.html',
  styleUrl: './eligible-items.component.css',
})
export class EligibleItemsComponent implements OnInit {
  columns = ['name', 'description', 'menu'];
  couponId: string;
  searchControl: FormControl;
  isFilterApplied: boolean = false;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10
  })

  dialog = inject(MatDialog) 

  couponStore = inject(CouponStore);
  eligibleItemsStore = inject(EligibleItemsStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  eligibleItems = this.eligibleItemsStore.items;
  coupon = this.couponStore.coupon.data;
  isLoading = this.eligibleItemsStore.isLoading;
  count = this.eligibleItemsStore.count;

  datasource = new MatTableDataSource<ItemDto>();

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.searchControl = new FormControl('');
    this.isFilterApplied = false;

    effect(() => {
      const items = this.eligibleItems() ?? [];
      const { pageIndex, pageSize } = this.paginationOptions();

      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, items.length);

      this.datasource.data = items.slice(start, end);
    });
  }

  ngOnInit() {
    this.eligibleItemsStore.resetLoadedPages();

    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });

    this.eligibleItemsStore.fetchItems({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
    });

    this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.isFilterApplied = true;
      this.eligibleItemsStore.fetchItems({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        filter: {
          name: value.trim()
        },
      });
    })

    OnEligibleItemsSuccess.subscribe((res) => {
      if(res) {
        this.eligibleItemsStore.resetLoadedPages();
        this.paginationOptions.set({
          pageIndex: 0,
          pageSize: 10
        })
      }
    })
  }

  onAddItem() {
    if(this.can('create', CreateCouponItemDto)) {
      this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.couponId}/items/edit`], {
        queryParams: {
          'redirect': btoa(this.router.url)
        }
      })
    } else {
      const rule = this.ability.relevantRuleFor('create', CreateCouponItemDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.eligibleItemsStore.fetchItems({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
    });
  }

  onRemove(item: ItemDto) {
    if(this.can('delete', CouponItemDto)) {
      this.eligibleItemsStore.deleteItem({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        itemId: item.itemId!
      })
    } else {
      const rule = this.ability.relevantRuleFor('delete', CouponItemDto);
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
}
