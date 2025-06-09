import { Component, inject, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CouponStore } from '../store/coupon.store';
import { OrganizationStore } from '../../../../../store/organization.store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CurrencyPipe } from '@angular/common';
import { onChangeStatusSuccess } from '../coupon-tab/campaigns/store/campaigns.store';

@Component({
  selector: 'app-coupon-summary',
  imports: [MatCardModule, NgxSkeletonLoaderModule, CurrencyPipe],
  templateUrl: './coupon-summary.component.html',
  styleUrl: './coupon-summary.component.css',
})
export class CouponSummaryComponent implements OnInit {
  @Input() couponId!: string;
  @Input() organizationId!: string;

  couponStore = inject(CouponStore);
  oraganizationStore = inject(OrganizationStore);

  isLoading = this.couponStore.couponStatistics.isLoading;
  couponSummary = this.couponStore.couponStatistics.data;
  coupon = this.couponStore.coupon.data;
  organization = this.oraganizationStore.organizaiton;
  ngOnInit(): void {
    this.couponStore.fetchCouponSummary({
      organizationId: this.organizationId,
      couponId: this.couponId,
    });

    onChangeStatusSuccess.subscribe((res) => {
      this.couponStore.fetchCouponSummary({
        organizationId: this.organizationId,
        couponId: this.couponId,
      });
    })
  }
}
