import { Component, OnInit } from '@angular/core';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { AddMoreComponent } from './add-more/add-more.component';

@Component({
  selector: 'app-create-customers',
  imports: [CreateCustomerComponent, AddMoreComponent],
  templateUrl: './create-customers.component.html',
  styleUrls: ['./create-customers.component.css']
})
export class CreateCustomersComponent {
  currentScreen = 'create-customer';

  changeScreen(value: string) {
    if(value == 'add-more') {
      this.currentScreen = value;
    } else {
      this.currentScreen = value;
    }
  }

}
