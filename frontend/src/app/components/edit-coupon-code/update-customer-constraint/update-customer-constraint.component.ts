import { NgClass } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { OrganizationStore } from '../../../store/organization.store';
import { CouponCodeStore } from '../store/coupon-code.store';
import { CampaignStore } from '../store/campaign.store';
import { CouponStore } from '../store/coupon.store';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { UpdateCouponCodeDto } from '../../../../dtos/coupon-code.dto';
import { UpdateCustomerCouponCodeDto } from '../../../../dtos/customer-coupon-code.dto';
import { CustomerDto } from '../../../../dtos/customer.dto';
import { customerConstraintEnum } from '../../../../enums';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CustomersStore } from '../store/customers.store';
import {
  CustomerCouponCodeStore,
  onCustomerCouponCodeSuccess,
} from '../store/customer-coupon-code.store';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-customer-constraint',
  imports: [
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './update-customer-constraint.component.html',
  styleUrls: ['./update-customer-constraint.component.css'],
})
export class UpdateCustomerConstraintComponent implements OnInit {
  customerConstraint: string;
  selectedCustomers: CustomerDto[];
  updateCouponCodeForm: FormGroup;
  eligibleCustomersForm: FormGroup;
  searchControl: FormControl;

  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);
  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);
  customersStore = inject(CustomersStore);
  customerCouponCodeStore = inject(CustomerCouponCodeStore);

  coupon = this.couponStore.data;
  campaign = this.campaignStore.data;
  couponCode = this.couponCodeStore.data;
  organization = this.organizationStore.organizaiton;
  customers = this.customersStore.customers;
  customerCouponCode = this.customerCouponCodeStore.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;

  constructor(
    private formBuilder: RxFormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerConstraint = '';
    this.selectedCustomers = [];
    this.updateCouponCodeForm = formBuilder.formGroup(
      new UpdateCouponCodeDto()
    );
    this.eligibleCustomersForm = formBuilder.formGroup(
      new UpdateCustomerCouponCodeDto()
    );
    this.searchControl = new FormControl('');

    effect(() => {
      if (this.couponCode()) {
        this.customerConstraint =
          this.couponCode()?.customerConstraint == customerConstraintEnum.ALL
            ? 'all'
            : 'specific';
      }

      if (this.customerCouponCode()) {
        this.selectedCustomers = this.customerCouponCode()!;
      }
    });

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        this.updateCustomerCouponCode();

        onCustomerCouponCodeSuccess.subscribe((res) => {
          if (res) {
            this.router.navigate([
              `/${this.organization()?.organizationId}/home/coupons/${
                this.coupon()?.couponId
              }/campaigns/${this.campaign()?.campaignId}/coupon-codes/${
                this.couponCode()?.couponCodeId
              }`,
            ]);
          }
        });
      }

      if (this.isBackClicked()) {
        this.couponCodeStore.setOnBack();
        this.router.navigate(['../code-details'], { relativeTo: this.route });
      }
    });
  }

  ngOnInit() {
    this.customersStore.fetchCustomers({
      organizationId: this.organization()?.organizationId!,
    });

    this.searchControl.valueChanges.subscribe((value) => {
      this.customersStore.fetchCustomers({
        organizationId: this.organization()?.organizationId!,
        filter: {
          email: value,
        },
      });
    });
  }

  displayWithItems = () => '';

  selectedCustomer(customer: CustomerDto) {
    const index = this.selectedCustomers.indexOf(customer);
    if (index == -1) {
      this.selectedCustomers.push(customer);
    } else if (index !== -1) {
      this.selectedCustomers.splice(index, 1);
    }
    this.eligibleCustomersForm.get('customers')?.setValue(null);
  }

  isCustomerSelected(customer: CustomerDto): boolean {
    return this.selectedCustomers.some(
      (selected) => selected.customerId === customer.customerId
    );
  }

  updateCustomerCouponCode() {
    this.customerCouponCodeStore.configureCustomerCouponCode({
      organizationId: this.organization()?.organizationId!,
      couponId: this.coupon()?.couponId!,
      campaignId: this.campaign()?.campaignId!,
      couponCodeId: this.couponCode()?.couponCodeId!,
      customerConstraint:
        this.customerConstraint == 'all'
          ? customerConstraintEnum.ALL
          : customerConstraintEnum.SPECIFIC,
      customers: this.selectedCustomers.map((customer) => customer.customerId!),
    });
  }
}
