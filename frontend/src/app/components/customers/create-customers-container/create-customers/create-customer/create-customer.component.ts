import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
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
export class CreateCustomerComponent implements OnInit {
  @Input() editedCustomer?: CreateCustomerDto;
  @Input() index?: number;
  
  @Output() currentScreenEvent = new EventEmitter<string>();

  createCustomerForm: FormGroup;

  customerStore = inject(CustomerStore);

  customer = this.customerStore.customer;
  isNextClicked = this.customerStore.onNext;

  constructor(private formBuilder: RxFormBuilder) {
    this.createCustomerForm = formBuilder.formGroup(new CreateCustomerDto());

    effect(() => {
      if (this.isNextClicked()) {
        this.customerStore.setOnNext();
        this.createCustomerForm.markAllAsTouched();

        if (this.createCustomerForm.invalid) {
          return;
        }

        if(this.editedCustomer) {
          this.editCustomer();
        } else {
          this.createCustomer();
        }
        this.customerStore.nextStep();
        this.currentScreenEvent.emit('add-more');
      }
    });
  }

  ngOnInit(): void {
    if(this.editedCustomer !== undefined) {
      this.createCustomerForm.controls['name'].setValue(this.editedCustomer.name);
      this.createCustomerForm.controls['email'].setValue(this.editedCustomer.email);
      this.createCustomerForm.controls['phone'].setValue(this.editedCustomer.phone);
      this.createCustomerForm.controls['externalId'].setValue(this.editedCustomer.externalId);
    } else {
      this.createCustomerForm.reset();
    }
  }

  createCustomer() {
    const formValues = this.createCustomerForm.getRawValue();
    const newCustomer = new CreateCustomerDto();
    Object.assign(newCustomer, formValues);

    this.customerStore.setCustomer(newCustomer);
  }

  editCustomer() {
    const formValues = this.createCustomerForm.getRawValue();
    const updatedCustomer = new CreateCustomerDto();
    Object.assign(updatedCustomer, formValues);

    this.customerStore.updateCustomer(updatedCustomer, this.index!);
    this.createCustomerForm.reset();
    this.customerStore.resetCustomer();
  }
}
