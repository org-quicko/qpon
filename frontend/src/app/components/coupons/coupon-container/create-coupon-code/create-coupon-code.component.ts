import { Component, effect, inject, OnInit } from '@angular/core';
import { CreateCodeComponent } from './create-code/create-code.component';
import { OrganizationStore } from '../../../../store/organization.store';
import { CouponCodeStore } from '../../store/coupon-code.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateCouponCodeDto } from '../../../../../dtos/coupon-code.dto';
import { RedemptionLimitsComponent } from './redemption-limits/redemption-limits.component';
import { CustomerConstraintComponent } from './customer-constraint/customer-constraint.component';
import { AddMoreComponent } from './add-more/add-more.component';

@Component({
  selector: 'app-create-coupon-code',
  imports: [
    CreateCodeComponent,
    RedemptionLimitsComponent,
    CustomerConstraintComponent,
    AddMoreComponent,
  ],
  templateUrl: './create-coupon-code.component.html',
  styleUrls: ['./create-coupon-code.component.css'],
})
export class CreateCouponCodeComponent implements OnInit {
  couponId: string;
  campaignId: string;
  createCouponCodeForm: FormGroup;
  currentScreen = 'code';
  
  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  organization = this.organizationStore.organizaiton;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: RxFormBuilder
  ) {
    this.couponId = '';
    this.campaignId = '';
    this.createCouponCodeForm = formBuilder.formGroup(
      new CreateCouponCodeDto()
    );
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
    });
    if (this.coupon() == null) {
      this.couponCodeStore.fetchCoupon({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
      });
    }

    if (this.campaign() == null) {
      this.couponCodeStore.fetchCampaign({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        campaignId: this.campaignId,
      });
    }
  }

  changeScreen(value: string) {
    switch (value) {
      case 'code':
        this.currentScreen = value;
        break;
      case 'redemptions-limits':
        this.currentScreen = value;
        break;
        value;
      case 'customer-constraint':
        this.currentScreen = value;
        break;
      case 'add-more':
        this.currentScreen = value;
        break;
      default:
        break;
    }
  }
}
