import { Component, effect, inject, OnInit } from '@angular/core';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateCampaignDto } from '../../../../../dtos/campaign.dto';
import { OrganizationStore } from '../../../../store/organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-create-campaign',
  imports: [
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css'],
})
export class CreateCampaignComponent implements OnInit {
  couponId: string;
  redirectUri: string;
  createCampaignForm: FormGroup;
  budgetConstraintFormControl: FormControl;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  organization = this.organizationStore.organizaiton;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;

  constructor(private formBuilder: RxFormBuilder, private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.redirectUri = '';
    this.createCampaignForm = formBuilder.formGroup(new CreateCampaignDto());
    this.budgetConstraintFormControl = new FormControl('unlimited');

    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext();

        if (this.createCampaignForm.invalid) {
          this.createCampaignForm.markAllAsTouched();
          return;
        }

        this.createCampaign();
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });

    this.couponCodeStore.fetchCoupon({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect'];
    })

    CreateSuccess.subscribe((res) => {
      if(res) {
        this.createCampaignForm.reset();
        this.budgetConstraintFormControl.reset();
        this.couponCodeStore.nextStep();
        if(this.redirectUri) {
          this.router.navigate([atob(this.redirectUri)]);
        } else {
          this.router.navigate([`../${this.campaign()?.campaignId}/coupon-codes/create`], { relativeTo: this.route })
        }
      }
    })
  }

  createCampaign() {
    const campaign = new CreateCampaignDto();
    campaign.name = this.createCampaignForm.get('name')?.value;
    campaign.budget = this.createCampaignForm.get('budget')?.value;
    this.couponCodeStore.createCampaign({organizationId: this.organization()?.organizationId!, couponId: this.couponId, campaign});
  }
}
