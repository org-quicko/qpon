import { Component, effect, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CustomerStore, OnCustomerSuccess } from '../../store/customer.store';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationStore } from '../../../../../store/organization.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-more',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './add-more.component.html',
  styleUrls: ['./add-more.component.css']
})
export class AddMoreComponent {
  @Output() currentScreenEvent = new EventEmitter<string>();

  organizationStore = inject(OrganizationStore);
  customerStore = inject(CustomerStore);

  organization = this.organizationStore.organizaiton;
  customers = this.customerStore.customers;
  isNextClicked = this.customerStore.onNext;
  isBackClicked = this.customerStore.onBack;

  constructor(private router: Router) {
    effect(() => {
      if(this.isBackClicked()) {
        this.customerStore.setOnBack();
        this.customerStore.previousStep();
        this.currentScreenEvent.emit('create-customer');
      }
    })

    effect(() => {
      if(this.isNextClicked()) {
        this.customerStore.setOnNext();

        this.customerStore.createCustomer({
          organizationId: this.organization()?.organizationId!,
          customers: this.customerStore.customers()!
        })

        OnCustomerSuccess.subscribe((res) => {
          if(res) {
            this.router.navigate([`/${this.organization()?.organizationId}/home/customers`])
          }
        })
      }
    })
  }

  onAddMore() {
    this.customerStore.resetCustomer();
    this.customerStore.resetCurrentStep();
    this.currentScreenEvent.emit('create-customer');
  }
}
