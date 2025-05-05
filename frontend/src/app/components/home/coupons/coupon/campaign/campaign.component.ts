import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CouponStore } from '../store/coupon.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { take } from 'rxjs';
import { OrganizationStore } from '../../../../../store/organization.store';
import { CampaignStore } from './store/campaign.store';
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component';
import { CampaignSummaryComponent } from './campaign-summary/campaign-summary.component';
import { CouponCodeListComponent } from './coupon-code-list/coupon-code-list.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { onChangeStatusSuccess } from './coupon-code-list/store/coupon-codes.store';
import { CampaignsStore } from '../coupon-tab/campaigns/store/campaigns.store';

@Component({
  selector: 'app-campaign',
  imports: [
    MatIconModule,
    CampaignDetailsComponent,
    CampaignSummaryComponent,
    CouponCodeListComponent,
    NgxSkeletonLoaderModule,
  ],
  providers: [CouponStore, CampaignStore],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css'],
})
export class CampaignComponent implements OnInit {
  private couponId: string;
  private campaignId: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
  }

  campaignStore = inject(CampaignStore);
  couponStore = inject(CouponStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponStore.coupon.data;
  organization = this.organizationStore.organizaiton;
  campaign = this.campaignStore.campaign;
  isLoading = this.campaignStore.isLoading;

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
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

    onChangeStatusSuccess.subscribe((res) => {
      if(res) {
        this.campaignStore.fetchCampaignSummary({
          organizationId: this.organization()?.organizationId!,
          couponId: this.couponId,
          campaignId: this.campaignId,
        });
      }
    })
  }

  onNavigateChild() {
    this.router.navigate(['../../'], {
      relativeTo: this.route,
    });
  }

  onNavigateParent() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}
