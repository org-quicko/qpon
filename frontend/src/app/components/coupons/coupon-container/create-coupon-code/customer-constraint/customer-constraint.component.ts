import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CouponCodeStore } from '../../../store/coupon-code.store';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { CustomersStore } from '../../../../../store/customers.store';
import { CustomerDto } from '../../../../../../dtos/customer.dto';
import { MatDividerModule } from '@angular/material/divider';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateCustomerCouponCodeDto } from '../../../../../../dtos/customer-coupon-code.dto';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrganizationStore } from '../../../../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CreateCouponCodeDto } from '../../../../../../dtos/coupon-code.dto';
import { customerConstraintEnum, durationTypeEnum, visibilityEnum } from '../../../../../../enums';
import { MatChipsModule } from '@angular/material/chips';
import { SnackbarService } from '../../../../../services/snackbar.service';

@Component({
  selector: 'app-customer-constraint',
  imports: [
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './customer-constraint.component.html',
  styleUrls: ['./customer-constraint.component.css'],
})
export class CustomerConstraintComponent implements OnInit {
  @Input() createCouponCodeForm!: FormGroup;
  @Output() currentScreenEvent = new EventEmitter<string>();

  @ViewChild('customersInput') customersInput!: ElementRef<HTMLInputElement>;

  customerConstraint: string;
  selectedCustomers: CustomerDto[];
  eligibleCustomersForm: FormGroup;
  searchControl: FormControl;

  couponCodeStore = inject(CouponCodeStore);
  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  campaign = this.couponCodeStore.campaign.data;
  couponCode = this.couponCodeStore.couponCode.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;
  customers = this.customersStore.customers;
  organization = this.organizationStore.organizaiton;

  constructor(private formBuilder: RxFormBuilder, private snackBarService: SnackbarService) {
    
    this.customerConstraint = '';

    this.selectedCustomers =
      this.couponCodeStore
        .codesWithSpecificCustomers()
        ?.get(this.couponCodeStore.couponCode.data()?.code!) ? this.couponCodeStore
        .codesWithSpecificCustomers()
        ?.get(this.couponCodeStore.couponCode.data()?.code!)! : [];
    this.eligibleCustomersForm = formBuilder.formGroup(
      new CreateCustomerCouponCodeDto()
    );
    this.searchControl = new FormControl('');

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();

        if(!this.customerConstraint) {
          this.snackBarService.openSnackBar('Please select customer constraint', undefined);
          return;
        }

        this.setCouponCode();
        const nextIndex = this.couponCodeStore.couponCodeScreenIndex() + 1;
        this.couponCodeStore.setCouponCodeScreenIndex(nextIndex);
        this.currentScreenEvent.emit('add-more');
      }
    });

    effect(() => {
      if (this.isBackClicked()) {
        this.couponCodeStore.setOnBack();
        const prevIndex = this.couponCodeStore.couponCodeScreenIndex() - 1;
        this.couponCodeStore.setCouponCodeScreenIndex(Math.max(prevIndex, 0))
        this.currentScreenEvent.emit('redemptions-limits');
      }
    });
  }

  ngOnInit() {
    if (this.customers().length == 0) {
      this.customersStore.fetchCustomers({
        organizationId: this.organization()?.organizationId!,
      });
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.customersStore.fetchCustomers({
          organizationId: this.organization()?.organizationId!,
          filter: {
            email: value,
          },
        });
      });

    this.customerConstraint = this.createCouponCodeForm.controls['customerConstraint'].value
  }

  displayWithItems = () => '';

  selectedCustomer(customer: CustomerDto) {
    const index = this.selectedCustomers.findIndex(selected => selected.customerId === customer.customerId);
    if (index == -1) {
      this.selectedCustomers.push(customer);
    } else if (index !== -1) {
      this.selectedCustomers.splice(index, 1);
    }
    this.customersInput.nativeElement.value = '';
    this.eligibleCustomersForm.get('customers')?.setValue(null);
  }

  setCouponCode() {
    const newCouponCode = new CreateCouponCodeDto();
    newCouponCode.code = this.createCouponCodeForm.value['code'];
    newCouponCode.visibility = this.couponCode()?.visibility == 'public' ? visibilityEnum.PUBLIC : visibilityEnum.PRIVATE;
    newCouponCode.durationType = this.couponCode()?.durationType == 'forever' ? durationTypeEnum.FOREVER : durationTypeEnum.LIMITED;
    newCouponCode.customerConstraint = this.customerConstraint == 'all' ? customerConstraintEnum.ALL : customerConstraintEnum.SPECIFIC;
    newCouponCode.expiresAt = this.couponCode()?.expiresAt;
    newCouponCode.description = this.createCouponCodeForm.value['description'] || null;
    newCouponCode.maxRedemptionPerCustomer = this.createCouponCodeForm.value['maxRedemptionPerCustomer'];
    newCouponCode.maxRedemptions = this.createCouponCodeForm.value['maxRedemptions'];
    newCouponCode.minimumAmount = this.createCouponCodeForm.value['minimumAmount']
    this.couponCodeStore.setCustomerConstraint(this.customerConstraint);

    if(this.customerConstraint == 'all') {
      this.couponCodeStore.removeCodeWithSpecificCustomers(this.createCouponCodeForm.value['code'])
    } else {
      const code = this.couponCodeStore.couponCode.data()?.code!;
      this.couponCodeStore.setCodeWithSpecificCustomers(
        code,
        this.selectedCustomers
      );
    }

    this.couponCodeStore.setCouponCodes(
      newCouponCode
    );
    this.createCouponCodeForm.reset();
  }

  isCustomerSelected(customer: CustomerDto): boolean {
      return this.selectedCustomers.some(selected => selected.customerId === customer.customerId);
  }
}
