import { NgClass } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CouponDto, CreateCouponDto } from '../../../../../dtos/coupon.dto';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MatIconModule } from '@angular/material/icon';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { OrganizationStore } from '../../../../store/organization.store';
import { discountTypeEnum, itemConstraintEnum } from '../../../../../enums';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-create-coupon',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './create-coupon.component.html',
  styleUrls: ['./create-coupon.component.css'],
})
export class CreateCouponComponent implements OnInit {
  discountType: string = 'percentage';
  maxAmount: boolean = false;
  maxAmountFormControl: FormControl;
  couponFormGroup: FormGroup;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  isNextClicked = this.couponCodeStore.onNext;
  coupon = this.couponCodeStore.coupon.data;

  constructor(
    private formBuilder: RxFormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.maxAmountFormControl = new FormControl(false);
    this.couponFormGroup = this.formBuilder.formGroup(new CreateCouponDto());

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        this.createCoupon();
      }
    });
  }

  ngOnInit(): void {
    CreateSuccess.pipe(take(1)).subscribe((res) => {
      this.couponCodeStore.nextStep();
      this.router.navigate([`../${this.coupon()?.couponId}/items/edit`], {
        relativeTo: this.route,
      });
    });
  }

  createCoupon() {
    const coupon = new CreateCouponDto();
    coupon.name = this.couponFormGroup.value['name'];
    coupon.discountType =
      this.discountType == 'percentage'
        ? discountTypeEnum.PERCENTAGE
        : discountTypeEnum.FIXED;
    coupon.discountValue = parseFloat(
      this.couponFormGroup.value['discountValue']
    );
    coupon.discountUpto = this.maxAmount
      ? this.couponFormGroup.value['discountUpto']
      : null;
    coupon.itemConstraint = itemConstraintEnum.ALL;
    this.couponCodeStore.createCoupon({
      organizationId: this.organization()?.organizationId!,
      coupon: instanceToPlain(coupon),
    });
  }
}
