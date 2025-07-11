import { Component, effect, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CouponCodeStore } from '../../../store/coupon-code.store';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getCurrencySymbol } from '@angular/common';
import { OrganizationStore } from '../../../../../store/organization.store';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { CreateCouponCodeDto } from '../../../../../../dtos/coupon-code.dto';

@Component({
  selector: 'app-redemption-limits',
  imports: [MatIconModule, MatCheckboxModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './redemption-limits.component.html',
  styleUrls: ['./redemption-limits.component.css']
})
export class RedemptionLimitsComponent implements OnInit {

  @Input() createCouponCodeForm!: FormGroup;
  @Input() couponToEdit!: CreateCouponCodeDto;
  @Output() currentScreenEvent = new EventEmitter<string>();

  minimumAmountChecked!: FormControl;
  maxRedemptionsChecked!: FormControl;
  maxRedemptionsPerCustomerChecked!: FormControl;
  placeholder!: string;

  organizationStore = inject(OrganizationStore);
  couponCodeStore = inject(CouponCodeStore);

  coupon = this.couponCodeStore.coupon.data;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;
  organization = this.organizationStore.organizaiton;

  constructor(private snackbarService: SnackbarService) {
    this.minimumAmountChecked = new FormControl(false);
    this.maxRedemptionsChecked = new FormControl(false);
    this.maxRedemptionsPerCustomerChecked = new FormControl(false);

    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext();

        if((this.minimumAmountChecked.value && !this.createCouponCodeForm.get('minimumAmount')?.value) || (this.maxRedemptionsChecked.value && !this.createCouponCodeForm.get('maxRedemptions')?.value) || (this.maxRedemptionsPerCustomerChecked.value && !this.createCouponCodeForm.get('maxRedemptionPerCustomer')?.value)) {
          this.snackbarService.openSnackBar('Enter the value', undefined);
          return;
        }

        if(this.createCouponCodeForm.controls['maxRedemptions'].hasError('min') || 
        this.createCouponCodeForm.controls['minimumAmount'].hasError('min') ||
        this.createCouponCodeForm.controls['maxRedemptionPerCustomer'].hasError('min')) {
          this.snackbarService.openSnackBar('Values should be greater than 0', undefined);
          return;
        }

        if(this.minimumAmountChecked.value && this.createCouponCodeForm.get('minimumAmount')?.value) {
          this.couponCodeStore.setCouponCode({minimumAmount: this.createCouponCodeForm.get('minimumAmount')?.value})
        } else if(!this.minimumAmountChecked.value) {
          this.couponCodeStore.setCouponCode({minimumAmount: null})
        }

        if(this.maxRedemptionsChecked.value && this.createCouponCodeForm.get('maxRedemptions')?.value) {
          this.couponCodeStore.setCouponCode({maxRedemptions: this.createCouponCodeForm.get('maxRedemptions')?.value})
        } else if(!this.maxRedemptionsChecked.value) {
          this.couponCodeStore.setCouponCode({maxRedemptions: null})
        }

        if(this.maxRedemptionsPerCustomerChecked.value && this.createCouponCodeForm.get('maxRedemptionPerCustomer')?.value) {
          this.couponCodeStore.setCouponCode({maxRedemptionPerCustomer: this.createCouponCodeForm.get('maxRedemptionPerCustomer')?.value})
        } else if(!this.maxRedemptionsPerCustomerChecked.value) {
          this.couponCodeStore.setCouponCode({maxRedemptionPerCustomer: null})
        }
        const nextIndex = this.couponCodeStore.couponCodeScreenIndex() + 1;
        this.couponCodeStore.setCouponCodeScreenIndex(nextIndex);
        this.currentScreenEvent.emit('customer-constraint')
      }
    })

    effect(() => {
      if(this.couponCodeStore.onBack()) {
        this.couponCodeStore.setOnBack();
        const prevIndex = this.couponCodeStore.couponCodeScreenIndex() - 1;
        this.couponCodeStore.setCouponCodeScreenIndex(Math.max(prevIndex, 0))
        this.currentScreenEvent.emit('code')
      }
    })
   }

  ngOnInit() {

    this.minimumAmountChecked.setValue(this.createCouponCodeForm.controls['minimumAmount'].value > 0 ? true : false);
    this.maxRedemptionsChecked.setValue(this.createCouponCodeForm.controls['maxRedemptions'].value > 0 ? true : false);
    this.maxRedemptionsPerCustomerChecked.setValue(this.createCouponCodeForm.controls['maxRedemptionPerCustomer'].value > 0 ? true : false);

    this.createCouponCodeForm.controls['maxRedemptions'].setValidators(Validators.min(0));
    this.createCouponCodeForm.controls['minimumAmount'].setValidators(Validators.min(0));
    this.createCouponCodeForm.controls['maxRedemptionPerCustomer'].setValidators(Validators.min(0));

     // Disable all inputs initially if checkboxes are not checked
     if (!this.minimumAmountChecked.value || this.createCouponCodeForm.controls['minimumAmount'].value == 0) {
      this.createCouponCodeForm.get('minimumAmount')?.disable();
    }
    if (!this.maxRedemptionsChecked.value) {
      this.createCouponCodeForm.get('maxRedemptions')?.disable();
    }
    if (!this.maxRedemptionsPerCustomerChecked.value) {
      this.createCouponCodeForm.get('maxRedemptionPerCustomer')?.disable();
    }

    this.minimumAmountChecked.valueChanges.subscribe(checked => {
      const control = this.createCouponCodeForm.get('minimumAmount');
      if (checked) {
        control?.enable();
      } else {
        control?.disable();
      }
    });

    this.maxRedemptionsChecked.valueChanges.subscribe(checked => {
      const control = this.createCouponCodeForm.get('maxRedemptions');
      if (checked) {
        control?.enable();
      } else {
        control?.disable();
      }
    });

    this.maxRedemptionsPerCustomerChecked.valueChanges.subscribe(checked => {
      const control = this.createCouponCodeForm.get('maxRedemptionPerCustomer');
      if (checked) {
        control?.enable();
        control?.setValue(1);
      } else {
        control?.disable();
      }
    });
  }

  getCurrencySymbolOnly(code: string): string {
    return getCurrencySymbol(code, 'narrow');
  }

}
