import { Component, effect, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CouponCodeStore } from '../../../store/coupon-code.store';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-redemption-limits',
  imports: [MatIconModule, MatCheckboxModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './redemption-limits.component.html',
  styleUrls: ['./redemption-limits.component.css']
})
export class RedemptionLimitsComponent implements OnInit {

  @Input() createCouponCodeForm!: FormGroup;
  @Output() currentScreenEvent = new EventEmitter<string>();

  minimumAmountChecked: FormControl;
  maxRedemptionsChecked: FormControl;
  maxRedemptionsPerCustomerChecked: FormControl;

  couponCodeStore = inject(CouponCodeStore);

  coupon = this.couponCodeStore.coupon.data;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;

  constructor() {

    this.minimumAmountChecked = new FormControl(false);
    this.maxRedemptionsChecked = new FormControl(false);
    this.maxRedemptionsPerCustomerChecked = new FormControl(false);

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

    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
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
     // Disable all inputs initially if checkboxes are not checked
     if (!this.minimumAmountChecked.value) {
      this.createCouponCodeForm.get('minimumAmount')?.disable();
    }
    if (!this.maxRedemptionsChecked.value) {
      this.createCouponCodeForm.get('maxRedemptions')?.disable();
    }
    if (!this.maxRedemptionsPerCustomerChecked.value) {
      this.createCouponCodeForm.get('maxRedemptionPerCustomer')?.disable();
    }
  }

}
