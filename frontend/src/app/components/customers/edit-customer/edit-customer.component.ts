import { Component, effect, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { email, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { UpdateCustomerDto } from '../../../../dtos/customer.dto';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationStore } from '../../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CustomerStore, OnCustomerSuccess } from './store/customer.store';
import { instanceToPlain } from 'class-transformer';

@Component({
  selector: 'app-edit-customer',
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  providers: [CustomerStore],
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.css'],
})
export class EditCustomerComponent implements OnInit {
  updateCustomerForm: FormGroup;
  customerId: string;

  organizationStore = inject(OrganizationStore);
  customerStore = inject(CustomerStore);

  organization = this.organizationStore.organizaiton;
  customer = this.customerStore.customer;
  isLoading = this.customerStore.isLoading;

  constructor(private formBuilder: RxFormBuilder, private router: Router, private route: ActivatedRoute) {
    this.updateCustomerForm = formBuilder.formGroup(new UpdateCustomerDto());
    this.customerId = '';

    effect(() => {
      if(this.customer()) {
        this.updateCustomerForm.patchValue({
          name: this.customer()?.name,
          email: this.customer()?.email,
          isdCode: this.customer()?.isdCode,
          phone: this.customer()?.phone,
          externalId: this.customer()?.externalId
        })
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.customerId = params['customer_id'];
    })

    this.customerStore.fetchCustomer({
      organizationId: this.organization()?.organizationId!,
      customerId: this.customerId
    })

    OnCustomerSuccess.subscribe((res) => {
      if(res) {
        this.router.navigate([`/${this.organization()?.organizationId}/home/customers`]);
      }
    })
  }

  onExit() {
    this.router.navigate([
      `/${this.organization()?.organizationId}/home/customers`,
    ]);
  }

  onSave() {
    if(this.updateCustomerForm.invalid) {
      return;
    }

    const formValues = this.updateCustomerForm.getRawValue();
    const updatedCustomer = new UpdateCustomerDto();
    Object.assign(updatedCustomer, formValues);

    this.customerStore.updateCustomer({
      organizationId: this.organization()?.organizationId!,
      customerId: this.customerId,
      body: instanceToPlain(updatedCustomer)
    })
  }
}
