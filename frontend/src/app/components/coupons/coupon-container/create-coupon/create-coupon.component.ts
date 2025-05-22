import { CurrencyPipe, NgClass, getCurrencySymbol } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CouponDto, CreateCouponDto } from '../../../../../dtos/coupon.dto';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MatIconModule } from '@angular/material/icon';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { OrganizationStore } from '../../../../store/organization.store';
import { discountTypeEnum, itemConstraintEnum } from '../../../../../enums';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { MatRadioModule } from '@angular/material/radio';
import { SnackbarService } from '../../../../services/snackbar.service';
import { getCountryCode, getCountryData } from 'countries-list';

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
  inputSize: number
  placeholder = "0";

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  isNextClicked = this.couponCodeStore.onNext;
  coupon = this.couponCodeStore.coupon.data;

  constructor(
    private formBuilder: RxFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService
  ) {
    this.maxAmountFormControl = new FormControl(false);
    this.couponFormGroup = this.formBuilder.formGroup(new CreateCouponDto());
    this.inputSize = 0;

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();

        if(this.couponFormGroup.invalid) {
          this.snackbarService.openSnackBar('Please fill all the required fields', undefined);
          return;
        }

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

    this.couponFormGroup.controls['discountValue'].valueChanges.subscribe((value) => {
    });

    this.couponFormGroup.controls['discountType'].valueChanges.subscribe((type) => {
      if(type == discountTypeEnum.PERCENTAGE) {
        this.couponFormGroup.controls['discountValue'].setValidators([Validators.min(0), Validators.max(100)]);
      } else {
        this.couponFormGroup.controls['discountValue'].setValidators([Validators.min(0)])
      }
    })
  }

  createCoupon() {

    if(this.couponFormGroup.invalid) {
      if(this.couponFormGroup.controls['discountValue'].hasError('max')) {
        this.snackbarService.openSnackBar('Value should be between 0 to 100', undefined);
      }

      if(this.couponFormGroup.controls['discountValue'].hasError('min')) {
        this.snackbarService.openSnackBar('Value should be greater than 0', undefined);
      }
      return;
    }

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


  adjustSize() {
    const value = this.couponFormGroup.controls['discountValue'].value;
    // always at least placeholder length, else the current text length
    this.inputSize = Math.max(this.placeholder.length-1, value?.length-1 || 0);
  }

  getCurrencySymbolOnly(code: string): string {
    return getCurrencySymbol(code, 'narrow');
  }

  updatePercentageWidth(input: HTMLInputElement): void {
    const value = input.value;
    const length = value ? value.length : 1;
    input.style.width = `${length}ch`;
  }
}
