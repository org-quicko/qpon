import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CouponCodeDto } from '../../../../../../../../dtos/coupon-code.dto';
import { TitleCasePipe } from '@angular/common';
import { CustomDatePipe } from '../../../../../../../pipe/date.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationStore } from '../../../../../../../store/organization.store';

@Component({
  selector: 'app-coupon-code-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    TitleCasePipe,
    CustomDatePipe,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './coupon-code-details.component.html',
  styleUrls: ['./coupon-code-details.component.css'],
})
export class CouponCodeDetailsComponent implements OnInit {
  @Input() couponCode!: Signal<CouponCodeDto | null>;
  @Input() isLoading!: Signal<boolean | null>;

  couponId: string;
  campaignId: string;
  couponCodeId: string;

  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    })
  }

  onEditCodeDetails() {
    this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.couponId}/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/code-details`], {
      queryParams: {
        'redirect': btoa(this.router.url)
      }
    })
  }

  onEditCustomerConstraint() {
    this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.couponId}/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/customer-constraint`], {
      queryParams: {
        'redirect': btoa(this.router.url)
      }
    })
  }
}
