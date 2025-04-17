import { Component, effect, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CouponCodeDto } from '../../../../../../../../dtos/coupon-code.dto';
import { TitleCasePipe } from '@angular/common';
import { CustomDatePipe } from '../../../../../../../pipe/date.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationStore } from '../../../../../../../store/organization.store';
import { CustomerCouponCodeStore } from '../store/customer-coupon-code.store';
import { customerConstraintEnum } from '../../../../../../../../enums';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-coupon-code-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
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
  customerConstraint: string;

  organizationStore = inject(OrganizationStore);
  customerCouponCodeStore = inject(CustomerCouponCodeStore);

  organization = this.organizationStore.organizaiton;
  customers = this.customerCouponCodeStore.data;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
    this.customerConstraint = '';

    effect(() => {
      if(this.couponCode()) {
        this.customerConstraint = this.couponCode()?.customerConstraint == customerConstraintEnum.ALL ? 'all' : 'specific';
      }
    })
    
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
