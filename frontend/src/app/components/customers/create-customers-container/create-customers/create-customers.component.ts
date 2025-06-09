import { Component, OnInit } from '@angular/core';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { AddMoreComponent } from './add-more/add-more.component';
import { CreateCustomerDto } from '../../../../../dtos/customer.dto';

@Component({
  selector: 'app-create-customers',
  imports: [CreateCustomerComponent, AddMoreComponent],
  templateUrl: './create-customers.component.html',
  styleUrls: ['./create-customers.component.css']
})
export class CreateCustomersComponent {
  currentScreen = 'create-customer';
  customer?: CreateCustomerDto;
  index!: number;

  changeScreen(value: string) {
    if(value == 'add-more') {
      this.customer = undefined;
      this.currentScreen = value;
    } else {
      this.currentScreen = value;
    }
  }

  editCustomerForPrefilling(value: {customer: CreateCustomerDto, index: number}) {
    this.customer = value.customer;
    this.index = value.index;
    this.currentScreen = 'create-customer'
  }
}
