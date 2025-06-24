import { Component, effect, EventEmitter, inject, Input, NgModule, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CouponCodeStore } from '../../../store/coupon-code.store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatTimepickerModule} from '@angular/material/timepicker';
import { provideMomentDateAdapter } from "@angular/material-moment-adapter";
import { CommonModule } from '@angular/common';
import { CreateCouponCodeDto } from '../../../../../../dtos/coupon-code.dto';
import { durationTypeEnum, visibilityEnum } from '../../../../../../enums';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { Subject, takeUntil } from 'rxjs';

export const MY_FORMATS = {
  parse: {
      dateInput: 'LL', // Standard parsing
      timeInput: 'HH:mm'
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
  selector: 'app-create-code',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatTimepickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  templateUrl: './create-code.component.html',
  styleUrls: ['./create-code.component.css'],
})
export class CreateCodeComponent implements OnInit {
  @Input() createCouponCodeForm!: FormGroup;
  @Output() currentScreenEvent = new EventEmitter<string>();
  destroy$ = new Subject<void>();

  minDate: Date;
  visibility: string;
  validity: string;
  errorMessage = signal<string>(''); 
  showValidationError = signal<boolean>(false);

  couponCodeStore = inject(CouponCodeStore);

  coupon = this.couponCodeStore.coupon.data;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;

  constructor(private snackBarService: SnackbarService) {
    this.minDate = new Date();
    this.visibility = this.couponCodeStore.couponCode.data()?.visibility ? this.couponCodeStore.couponCode.data()?.visibility! : "";
    this.validity = this.couponCodeStore.couponCode.data()?.durationType ? this.couponCodeStore.couponCode.data()?.durationType! : "";


    effect(() => {
      if(this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        this.createCouponCodeForm.markAllAsTouched();

        if(!this.validity || !this.visibility) {
          this.snackBarService.openSnackBar('Visibility or Validity not selected', undefined);
          this.showValidationError.set(true);
          return;
        }

        if (this.createCouponCodeForm.invalid) {
          this.errorMessage.set('Please fill out all required fields');
          this.showValidationError.set(true);
          return;
        }

        const couponCode = new CreateCouponCodeDto();
        couponCode.code = this.createCouponCodeForm.value['code'];
        couponCode.visibility = this.visibility == 'public' ? visibilityEnum.PUBLIC : visibilityEnum.PRIVATE;
        couponCode.durationType = this.validity == 'forever' ? durationTypeEnum.FOREVER : durationTypeEnum.LIMITED;        
        if(this.validity == 'limited') {
          if(!this.createCouponCodeForm.value['expiresAt']){
            this.createCouponCodeForm.get('expiresAt')?.setErrors({'required': true})
            this.errorMessage.set('Expiry not set');
            this.showValidationError.set(true);
            return;
          }
          const expiryDate = new Date(this.createCouponCodeForm.value['expiresAt']);
          expiryDate.setHours(23, 59, 59, 999); // Set to end of day
          couponCode.expiresAt = expiryDate.toISOString();
        }
        this.couponCodeStore.setCouponCode(couponCode);
        this.showValidationError.set(false);
        const nextIndex = this.couponCodeStore.couponCodeScreenIndex() + 1;
        this.couponCodeStore.setCouponCodeScreenIndex(nextIndex);
        this.currentScreenEvent.emit('redemptions-limits')
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

  ngOnInit(): void {
    this.createCouponCodeForm.controls['code'].setValidators(Validators.required)
    this.createCouponCodeForm.controls['visibility'].setValidators(Validators.required)

     this.createCouponCodeForm.get('code')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
    if (value && value !== value.toUpperCase()) {
      this.createCouponCodeForm.get('code')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
