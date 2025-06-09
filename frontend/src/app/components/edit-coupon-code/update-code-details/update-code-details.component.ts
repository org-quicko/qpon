import { NgClass } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CouponStore } from '../store/coupon.store';
import { CampaignStore } from '../store/campaign.store';
import { CouponCodeStore, onCouponCodeSuccess } from '../store/coupon-code.store';
import { OrganizationStore } from '../../../store/organization.store';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import {
  CouponCodeDto,
  UpdateCouponCodeDto,
} from '../../../../dtos/coupon-code.dto';
import {
  customerConstraintEnum,
  durationTypeEnum,
  visibilityEnum,
} from '../../../../enums';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CouponCodeDetailsComponent } from '../../home/coupons/coupon/campaign/coupon-code/coupon-code-details/coupon-code-details.component';
import { instanceToPlain } from 'class-transformer';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL', // Standard parsing
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'Do MMM, YYYY', // <-- Adds ordinal suffix (1st, 2nd, 3rd...)
    timeInput: 'HH:mm', // <- Required for MatTimepicker
    timeOptionLabel: 'hh:mm A',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-update-code-details',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatRadioModule,
    ReactiveFormsModule,
    NgClass,
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  templateUrl: './update-code-details.component.html',
  styleUrls: ['./update-code-details.component.css'],
})
export class UpdateCodeDetailsComponent implements OnInit {
  updateCouponCodeForm: FormGroup;
  visibility: string;
  validity: string;
  redirectUri: string;

  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);
  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponStore.data;
  campaign = this.campaignStore.data;
  couponCode = this.couponCodeStore.data;
  isNextClicked = this.couponCodeStore.onNext;
  organization = this.organizationStore.organizaiton;

  constructor(
    private formBuilder: RxFormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirectUri = '';
    this.updateCouponCodeForm = formBuilder.formGroup(
      new UpdateCouponCodeDto()
    );
    this.visibility = (this.couponCode()?.visibility == 'public' ? visibilityEnum.PUBLIC : visibilityEnum.PRIVATE) ??  '';
    this.validity = (this.couponCode()?.durationType == 'forever' ? durationTypeEnum.FOREVER : durationTypeEnum.LIMITED) ??  '';

    this.updateCouponCodeForm.get('expiresAt')?.setValue(this.couponCode()?.expiresAt ?? '');

    effect(() => {
      if (this.couponCode()) {
        this.visibility =
          this.couponCode()?.visibility == visibilityEnum.PUBLIC
            ? 'public'
            : 'private';
        this.validity =
          this.couponCode()?.durationType == durationTypeEnum.FOREVER
            ? 'forever'
            : 'limited';

        this.updateCouponCodeForm.patchValue({
          description: this.couponCode()?.description,
          expiresAt: this.couponCode()?.expiresAt,
        });
      }
    });

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        let couponCode = new CouponCodeDto();
        couponCode = {
          ...this.couponCode(),
          description: this.updateCouponCodeForm.value['description'],
          visibility: this.visibility == 'public' ? visibilityEnum.PUBLIC : visibilityEnum.PRIVATE,
          durationType: this.validity == 'forever' ? durationTypeEnum.FOREVER : durationTypeEnum.LIMITED,
          expiresAt: this.validity == 'limited' ? this.updateCouponCodeForm.value['expiresAt'] : undefined
        }
        this.couponCodeStore.setCouponCode(couponCode);

        this.updateCouponCode(couponCode);

        onCouponCodeSuccess.subscribe((res) => {
          if(res) {
            if(this.redirectUri) {
              this.router.navigate([atob(this.redirectUri)]);
            } else {
              this.router.navigate(['../customer-constraint'], {
                relativeTo: this.route,
              });
            }
          }
        })
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect'];
    })
  }

  updateCouponCode(couponCode: CouponCodeDto) {
    const updatedCouponCode = new UpdateCouponCodeDto();
    updatedCouponCode.description = couponCode.description;
    updatedCouponCode.visibility = couponCode.visibility;
    updatedCouponCode.durationType = couponCode.durationType;
    if(couponCode.durationType == durationTypeEnum.FOREVER) {
      updatedCouponCode.expiresAt = undefined;
    } else {
      updatedCouponCode.expiresAt = couponCode.expiresAt ? new Date(couponCode.expiresAt).toISOString() : undefined;
    }

    this.couponCodeStore.updateCouponCode({
      organizationId: this.organization()?.organizationId!,
      couponId: this.coupon()?.couponId!,
      campaignId: this.campaign()?.campaignId!,
      couponCodeId: this.couponCode()?.couponCodeId!,
      body: instanceToPlain(updatedCouponCode)
    })
  }
}
