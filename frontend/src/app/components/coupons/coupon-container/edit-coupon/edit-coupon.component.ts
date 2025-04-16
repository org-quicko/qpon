import { Component, effect, inject, OnInit } from '@angular/core';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationStore } from '../../../../store/organization.store';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { UpdateCouponDto } from '../../../../../dtos/coupon.dto';
import { AlertTileComponent } from '../common/alert-tile/alert-tile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { NgClass } from '@angular/common';
import { discountTypeEnum } from '../../../../../enums';

@Component({
  selector: 'app-edit-coupon',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    AlertTileComponent,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-coupon.component.html',
  styleUrls: ['./edit-coupon.component.css'],
})
export class EditCouponComponent implements OnInit {
  couponId: string;
  updateCouponForm: FormGroup;
  maxAmount!: boolean;
  discountType: string;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  organization = this.organizationStore.organizaiton;
  isNextClicked = this.couponCodeStore.onNext;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: RxFormBuilder
  ) {
    this.couponId = '';
    this.discountType = '';
    this.updateCouponForm = formBuilder.group(new UpdateCouponDto());


    effect(() => {
      if(this.coupon()) {
        this.discountType = this.coupon()?.discountType == discountTypeEnum.FIXED ? 'fixed' : 'percentage'
        this.maxAmount = !!(this.coupon()?.discountUpto && parseInt(this.coupon()?.discountUpto!) > 0);

        this.updateCouponForm.patchValue({
          name: this.coupon()?.name
        })
      }
    })

    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext()
        this.updateCoupon();
        
        CreateSuccess.subscribe((res) => {
          if(res){
            this.couponCodeStore.nextStep();
            this.router.navigate([`../items/edit`], {
              relativeTo: this.route,
            });
          }
        })
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
  }

  updateCoupon() {
    const updatedCoupon = new UpdateCouponDto();
    updatedCoupon.name = this.updateCouponForm.value['name'];
    this.couponCodeStore.updateCoupon({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      body: updatedCoupon
    })
  }
}
