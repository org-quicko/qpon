import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { email, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateCustomerDto } from '../../../../../../dtos/customer.dto';
import { CustomerStore } from '../../store/customer.store';

@Component({
  selector: 'app-create-customer',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css'],
})
export class CreateCustomerComponent {
  @Output() currentScreenEvent = new EventEmitter<string>();

  createCustomerForm: FormGroup;

  customerStore = inject(CustomerStore);

  customer = this.customerStore.customer;
  isNextClicked = this.customerStore.onNext;

  constructor(private formBuilder: RxFormBuilder) {
    this.createCustomerForm = formBuilder.formGroup(new CreateCustomerDto());

    effect(() => {
      const customer = this.customer();
      if (customer && !this.createCustomerForm.dirty) {
        this.createCustomerForm.patchValue({ ...customer });
      }
    });

    effect(() => {
      if (this.isNextClicked()) {
        this.customerStore.setOnNext();
        this.createCustomerForm.markAllAsTouched();

        if (this.createCustomerForm.invalid) {
          return;
        }

        this.createCustomer();
        this.customerStore.nextStep();
        this.currentScreenEvent.emit('add-more');
      }
    });
  }

  createCustomer() {
    const formValues = this.createCustomerForm.getRawValue();
    const newCustomer = new CreateCustomerDto();
    Object.assign(newCustomer, formValues);

    this.customerStore.setCustomer(newCustomer);
  }
}
