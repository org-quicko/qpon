import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CouponStore } from '../../store/coupon.store';
import { CampaignStore } from '../store/campaign.store';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { CouponCodeStore, OnCouponCodeSuccess } from './store/coupon-code.store';
import { SnackbarService } from '../../../../../../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import { CouponCodeDetailsComponent } from './coupon-code-details/coupon-code-details.component';
import { RedemptionListComponent } from './redemption-list/redemption-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerCouponCodeStore } from './store/customer-coupon-code.store';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../common/delete-dialog/delete-dialog.component';
import { UserAbility, UserAbilityTuple } from '../../../../../../permissions/ability';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { CouponCodeDto, UpdateCouponCodeDto } from '../../../../../../../dtos/coupon-code.dto';
import { NotAllowedDialogBoxComponent } from '../../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { InactiveMessageDialogComponent } from '../../../../common/inactive-message-dialog/inactive-message-dialog.component';
import { CouponCodeChangeStatusDialogComponent } from './coupon-code-change-status-dialog/coupon-code-change-status-dialog.component';
import { campaignStatusEnum, couponCodeStatusEnum } from '../../../../../../../enums';

@Component({
  selector: 'app-coupon-code',
  imports: [
    NgxSkeletonLoaderModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    CustomDatePipe,
    CouponCodeDetailsComponent,
    RedemptionListComponent,
  ],
  providers: [CouponStore, CampaignStore, CouponCodeStore, CustomerCouponCodeStore],
  templateUrl: './coupon-code.component.html',
  styleUrls: ['./coupon-code.component.css'],
})
export class CouponCodeComponent implements OnInit {
  couponId: string;
  campaignId: string;
  couponCodeId: string;
  copiedField: string | null = null;

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService
  ) {
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
  }

  dialog = inject(MatDialog);
  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);
  organizationStore = inject(OrganizationStore);
  couponCodeStore = inject(CouponCodeStore);
  customerCouponCodeStore = inject(CustomerCouponCodeStore);

  organization = this.organizationStore.organizaiton;
  coupon = this.couponStore.coupon.data;
  campaign = this.campaignStore.campaign;
  couponCode = this.couponCodeStore.couponCode;
  isLoading = this.campaignStore.isLoading;

  loading = this.couponCodeStore.isLoading;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    });

    this.couponStore.fetchCoupon({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
    });

    this.campaignStore.fetchCampaignSummary({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      campaignId: this.campaignId,
    });

    this.couponCodeStore.fetchCouponCode({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      campaignId: this.campaignId,
      couponCodeId: this.couponCodeId,
    });

    this.customerCouponCodeStore.fetchCustomersForCouponCode({
      couponId: this.couponId,
      campaignId: this.campaignId,
      couponCodeId: this.couponCodeId
    })

    OnCouponCodeSuccess.subscribe((res) => {
      if(res) {
        this.dialog.closeAll();
        this.router.navigate([`../../`], { relativeTo: this.route })
      }
    })
  }

  onNavigateToCouponView() {
    this.router.navigate(['../../../../'], {
      relativeTo: this.route,
    });
  }

  onNavigateToCampaignView() {
    this.router.navigate(['../../'], {
      relativeTo: this.route,
    });
  }

  onNavigateParent() {
    this.router.navigate(['../../../../../'], { relativeTo: this.route });
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

  onEdit() {
    if(this.can('update', UpdateCouponCodeDto)) {
      this.router.navigate([
        `/${this.organization()?.organizationId}/coupons/${
          this.couponId
        }/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/code-details`,
      ]);
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponCodeDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openDeleteDialog() {
    if(this.can('delete', CouponCodeDto)) {
      this.dialog.open(DeleteDialogComponent, {
        autoFocus: false,
        data: {
          title: `Delete ‘${this.couponCode()?.code}’ coupon code?`,
          description: `Are you sure you want to delete ‘${this.couponCode()?.code}’? You will lose all the data related to this coupon code!`,
          onDelete: () => this.couponCodeStore.deleteCouponCode({
            organizationId: this.organization()?.organizationId!,
            couponId: this.couponId,
            campaignId: this.campaignId,
            couponCodeId: this.couponCodeId
          })
        }
      })
    } else {
      const rule = this.ability.relevantRuleFor('delete', CouponCodeDto);
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

  
  openInvactiveMessageDialogForChangeStatus() {
    this.dialog.open(InactiveMessageDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Campaign inactive!',
        description: 'You can’t mark this coupon code as active because the campaign is marked inactive.'
      }
    })
}

  openChangeStatusDialog(couponCode: CouponCodeDto) {
      if(this.can('update', UpdateCouponCodeDto)) {
        if(this.campaign()?.getStatus() == campaignStatusEnum.EXHAUSTED) {
          this.snackbarService.openSnackBar('Campaign is exhausted. You can not change the status of this coupon code.', undefined);
          return;
        }

        if(this.couponCode()?.status === couponCodeStatusEnum.REDEEMED) {
          this.snackbarService.openSnackBar('Coupon code is redeemed. You can not change the status of this coupon code.', undefined);
          return;
        }

        this.dialog.open(CouponCodeChangeStatusDialogComponent, {
          data: {
            couponCode,
            campaignId: this.campaignId,
            couponId: this.couponId,
            organizationId: this.organization()?.organizationId,
            activateCouponCode: this.couponCodeStore.activateCouponCode,
            deactivateCouponCode: this.couponCodeStore.deactivateCouponCode,
          },
          autoFocus: false,
        });
      } else {
        const rule = this.ability.relevantRuleFor('update', UpdateCouponCodeDto);
        this.openNotAllowedDialogBox(rule?.reason!);
      }
    }
}
