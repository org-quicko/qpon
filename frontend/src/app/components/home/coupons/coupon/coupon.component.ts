import { Component, inject, OnInit } from '@angular/core';
import { CouponStore } from './store/coupon.store';
import { OrganizationStore } from '../../../../store/organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { take } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, TitleCasePipe } from '@angular/common';
import { CouponDetailsComponent } from "./coupon-details/coupon-details.component";
import { CouponSummaryComponent } from "./coupon-summary/coupon-summary.component";
import { CouponTabComponent } from "./coupon-tab/coupon-tab.component";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CampaignsStore } from './coupon-tab/campaigns/store/campaigns.store';
import { OnCouponsSuccess } from '../../../../store/coupons.store';

@Component({
  selector: 'app-coupon',
  imports: [MatIconModule, CouponDetailsComponent, CouponSummaryComponent, CouponTabComponent, NgxSkeletonLoaderModule],
  providers: [CouponStore, CampaignsStore],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css',
})
export class CouponComponent implements OnInit {
  organizationId: string;
  couponId: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.organizationId = '';
    this.couponId = '';
  }

  couponStore = inject(CouponStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  coupon = this.couponStore.coupon.data;
  couponSummary = this.couponStore.couponStatistics.data;
  isLoading = this.couponStore.coupon.isLoading;

  ngOnInit(): void {
    this.organizationId = this.organization()?.organizationId!;
    this.route.params.pipe().subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });
    this.loadData();

    OnCouponsSuccess.subscribe((res) => {
      if(res) {
        this.loadData();
      }
    })
  }

  loadData() {
    this.couponStore.fetchCoupon({
      organizationId: this.organizationId,
      couponId: this.couponId,
    });
  }

  onNavigateBreadcrumb() {
    this.router.navigate(['../'], {
      relativeTo: this.route,
    });
  }
}
