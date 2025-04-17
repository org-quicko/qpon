import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { CampaignSummaryRow } from '../../../../../../../generated/sources/campaign_summary_workbook';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgClass, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { CouponStore } from '../../store/coupon.store';

@Component({
  selector: 'app-campaign-details',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgxSkeletonLoaderModule,
    NgClass,
    TitleCasePipe,
  ],
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.css'],
})
export class CampaignDetailsComponent {
  @Input() campaign!: Signal<CampaignSummaryRow | null>;
  @Input() isLoading!: Signal<boolean | null>;

  organizationStore = inject(OrganizationStore);
  couponStore = inject(CouponStore);

  organization = this.organizationStore.organizaiton;
  coupon = this.couponStore.coupon.data;

  constructor(private router: Router) {}

  getFormattedDate(date: string) {
    return new Date(date).toDateString();
  }

  onEdit() {
    this.router.navigate(
      [
        `/${this.organization()?.organizationId}/coupons/${
          this.coupon()?.couponId
        }/campaigns/${this.campaign()?.getCampaignId()}/edit`,
      ],
      {
        queryParams: {
          redirect: btoa(this.router.url),
        },
      }
    );
  }
}
