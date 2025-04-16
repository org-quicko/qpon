import { Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { OrganizationStore } from '../../../../store/organization.store';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CreateCampaignDto, UpdateCampaignDto } from '../../../../../dtos/campaign.dto';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { AlertTileComponent } from '../common/alert-tile/alert-tile.component';

@Component({
  selector: 'app-edit-campaign',
  imports: [
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    NgClass,
    ReactiveFormsModule,
    AlertTileComponent,
  ],
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.css']
})
export class EditCampaignComponent implements OnInit {
  couponId: string;
  campaignId: string;
  redirectUri: string;
  updateCampaignForm: FormGroup;
  budgetConstraintFormControl: FormControl;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  organization = this.organizationStore.organizaiton;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;

  constructor(private formBuilder: RxFormBuilder, private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
    this.redirectUri = '';
    this.updateCampaignForm = formBuilder.formGroup(new UpdateCampaignDto());
    this.budgetConstraintFormControl = new FormControl('');
    this.budgetConstraintFormControl.disable()

    effect(() => {
      if(this.campaign()) {
        if(this.campaign()?.budget! > 0) {
          this.budgetConstraintFormControl.setValue('limited');
        } else {
          this.budgetConstraintFormControl.setValue('unlimited');
        }

        this.updateCampaignForm.patchValue({
          name: this.campaign()?.name
        })
      }
    })

    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        this.updateCampaign();
        CreateSuccess.subscribe((res) => {
          if(res) {
            this.updateCampaignForm.reset();
            if(this.redirectUri) {
              this.router.navigate([atob(this.redirectUri)]);
            } else {
              this.couponCodeStore.nextStep();
              this.router.navigate([`../${this.campaign()?.campaignId}/coupon-codes/create`], { relativeTo: this.route })
            }
          }
        })
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
    });

    this.couponCodeStore.fetchCampaign({
      couponId: this.couponId,
      campaignId: this.campaignId
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect'];
    })
  }

  updateCampaign() {
    const updatedCampaign = new UpdateCampaignDto();
    updatedCampaign.name = this.updateCampaignForm.value['name'];
    this.couponCodeStore.updateCampaign({
      couponId: this.couponId,
      campaignId: this.campaignId,
      body: updatedCampaign
    })
  }
}
