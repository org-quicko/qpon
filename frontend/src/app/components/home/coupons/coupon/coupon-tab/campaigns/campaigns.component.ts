import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CampaignsStore } from './store/campaigns.store';
import { CouponStore } from '../../store/coupon.store';
import { CouponDto } from '../../../../../../../dtos/coupon.dto';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CampaignSummaryRow } from '../../../../../../../generated/sources/campaign_summary_workbook';
import { MatInputModule } from '@angular/material/input';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import {
  CurrencyPipe,
  NgClass,
  NgFor,
  NgStyle,
  TitleCasePipe,
} from '@angular/common';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginationOptions } from '../../../../../../types/PaginatedOptions';
import { MatSortModule, Sort } from '@angular/material/sort';
import { sortOrderEnum } from '../../../../../../../enums';

@Component({
  selector: 'app-campaigns',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    CustomDatePipe,
    TitleCasePipe,
    CurrencyPipe,
    NgClass,
    NgxSkeletonLoaderComponent,
    ReactiveFormsModule,
  ],
  providers: [CampaignsStore, CouponStore],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.css',
})
export class CampaignsComponent implements OnInit {
  private couponId: string;
  filterForm: FormGroup;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  readonly dialog = inject(MatDialog);
  searchControl: FormControl;
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });
  sortOptions = signal<{ active: 'createdAt'; direction: 'asc' | 'desc' }>({
    active: 'createdAt',
    direction: 'desc',
  });

  campaignsStore = inject(CampaignsStore);
  organizationStore = inject(OrganizationStore);
  datasource = new MatTableDataSource<CampaignSummaryRow>();

  campaignSummaries = this.campaignsStore.campaignSummaries;
  count = this.campaignsStore.count;
  organization = this.organizationStore.organizaiton;
  isLoading = this.campaignsStore.isLoading;

  columns = [
    'name',
    'totalBudget',
    'totalDiscount',
    'redemptions',
    'status',
    'createdAt',
    'menu',
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.couponId = '';
    this.searchControl = new FormControl('');

    this.filterForm = this.formBuilder.group({
      status: null,
    });

    effect(() => {
      const campaignSummaries = this.campaignsStore.campaignSummaries() ?? [];
      const { pageIndex, pageSize } = this.paginationOptions();

      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, campaignSummaries.length);

      this.datasource.data = campaignSummaries.slice(start, end);
    });
  }

  ngOnInit(): void {
    this.campaignsStore.resetLoadedPages();

    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });

    this.campaignsStore.fetchCampaingSummaries({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: string) => {
        this.campaignsStore.fetchCampaingSummaries({
          organizationId: this.organization()?.organizationId!,
          couponId: this.couponId,
          query: {
            name: value,
          },
        });
      });
  }

  convertToCampaignSummaryRow(row: any[]) {
    return new CampaignSummaryRow(row);
  }

  openDialog(campaign: CampaignSummaryRow) {
    this.dialog.open(ChangeStatusComponent, {
      data: {
        couponId: this.couponId,
        campaign,
        deactivateCampaign: this.campaignsStore.deactivateCampaign,
        activateCampaign: this.campaignsStore.activateCampaign,
      },
      autoFocus: false,
    });
  }

  resetForm() {
    this.filterForm.reset();
  }

  onRowClick(campaignId: string) {
    this.router.navigate([`./campaigns/${campaignId}`], {
      relativeTo: this.route,
    });
  }

  onCreateCampaign() {
    this.router.navigate(
      [`../../../coupons/${this.couponId}/campaigns/create`],
      {
        relativeTo: this.route,
        queryParams: {
          redirect: btoa(this.router.url),
        },
      }
    );
  }

  onEditCampaign(campaignId: string) {
    this.router.navigate(
      [
        `/${this.organization()?.organizationId}/coupons/${
          this.couponId
        }/campaigns/${campaignId}/edit`,
      ],
      {
        queryParams: {
          redirect: btoa(this.router.url),
        },
      }
    );
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.campaignsStore.fetchCampaingSummaries({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
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

    this.campaignsStore.resetLoadedPages();

    this.campaignsStore.fetchCampaingSummaries({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
      isSortOperation: true
    });
  }
}
