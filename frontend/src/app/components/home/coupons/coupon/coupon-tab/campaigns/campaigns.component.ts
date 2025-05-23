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
import { campaignStatusEnum, sortOrderEnum } from '../../../../../../../enums';
import { InactiveMessageDialogComponent } from '../../../../common/inactive-message-dialog/inactive-message-dialog.component';
import {
  UserAbility,
  UserAbilityTuple,
} from '../../../../../../permissions/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { PureAbility } from '@casl/ability';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
} from '../../../../../../../dtos/campaign.dto';
import { NotAllowedDialogBoxComponent } from '../../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { OnCouponsSuccess } from '../../../../../../store/coupons.store';
import { SnackbarService } from '../../../../../../services/snackbar.service';

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
  isFilterApplied: boolean = false;

  couponStore = inject(CouponStore);
  campaignsStore = inject(CampaignsStore);
  organizationStore = inject(OrganizationStore);
  datasource = new MatTableDataSource<CampaignSummaryRow>();

  campaignSummaries = this.campaignsStore.campaignSummaries;
  count = this.campaignsStore.count;
  organization = this.organizationStore.organizaiton;
  isLoading = this.campaignsStore.isLoading;
  coupon = this.couponStore.coupon.data;

  columns = [
    'name',
    'totalBudget',
    'totalDiscount',
    'redemptions',
    'status',
    'createdAt',
    'menu',
  ];

  private readonly abilityService =
    inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
  protected readonly can = this.abilityService.can;
  private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbarService: SnackbarService,
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
        this.isFilterApplied = true;

        this.campaignsStore.fetchCampaingSummaries({
          organizationId: this.organization()?.organizationId!,
          couponId: this.couponId,
          query: {
            name: value,
          },
          isFilterApplied: this.isFilterApplied,
        });
      });

    OnCouponsSuccess.subscribe((res) => {
      this.campaignsStore.resetStore();
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
    });
  }

  convertToCampaignSummaryRow(row: any[]) {
    return new CampaignSummaryRow(row);
  }

  openDialog(campaign: CampaignSummaryRow) {
    if (this.can('update', UpdateCampaignDto)) {
      if(campaign.getStatus() === campaignStatusEnum.EXHAUSTED) {
        this.snackbarService.openSnackBar('Campaign is exhausted. You can not change the status of this campaign.', undefined);
        return;
      }
      this.dialog.open(ChangeStatusComponent, {
        data: {
          couponId: this.couponId,
          campaign,
          deactivateCampaign: this.campaignsStore.deactivateCampaign,
          activateCampaign: this.campaignsStore.activateCampaign,
        },
        autoFocus: false,
      });
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
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
    if (this.can('create', CreateCampaignDto)) {
      this.router.navigate(
        [`../../../coupons/${this.couponId}/campaigns/create`],
        {
          relativeTo: this.route,
          queryParams: {
            redirect: btoa(this.router.url),
          },
        }
      );
    } else {
      const rule = this.ability.relevantRuleFor('create', CreateCampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  onEditCampaign(campaignId: string) {
    if (this.can('update', UpdateCampaignDto)) {
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
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
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
      isSortOperation: true,
    });
  }

  openInvactiveMessageDialogForCampaign() {
    this.dialog.open(InactiveMessageDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Coupon inactive!',
        description:
          'You can’t create campaign because the coupon is marked inactive.',
      },
    });
  }

  openInvactiveMessageDialogForChangeStatus() {
    this.dialog.open(InactiveMessageDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Coupon inactive!',
        description:
          'You can’t mark this campaign as active because the coupon is marked inactive.',
      },
    });
  }

  openNotAllowedDialogBox(restrictionReason: string) {
    this.dialog.open(NotAllowedDialogBoxComponent, {
      data: {
        description: restrictionReason,
      },
    });
  }
}
