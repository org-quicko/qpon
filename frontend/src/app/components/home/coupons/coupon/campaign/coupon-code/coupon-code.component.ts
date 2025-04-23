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

  onNavigateChild() {
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
    this.router.navigate([
      `/${this.organization()?.organizationId}/coupons/${
        this.couponId
      }/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/code-details`,
    ]);
  }

  openDeleteDialog() {
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
  }
}
