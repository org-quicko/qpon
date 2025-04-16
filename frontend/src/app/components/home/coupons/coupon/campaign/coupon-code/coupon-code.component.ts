import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CouponStore } from '../../store/coupon.store';
import { CampaignStore } from '../store/campaign.store';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { CouponCodeStore } from './store/coupon-code.store';
import { SnackbarService } from '../../../../../../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import { CouponCodeDetailsComponent } from './coupon-code-details/coupon-code-details.component';
import { RedemptionListComponent } from './redemption-list/redemption-list.component';
import { MatMenuModule } from '@angular/material/menu';

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
  providers: [CouponStore, CampaignStore, CouponCodeStore],
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

  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);
  organizationStore = inject(OrganizationStore);
  couponCodeStore = inject(CouponCodeStore);

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
}
