import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomersStore } from '../../../store/customers.store';
import { OrganizationStore } from '../../../store/organization.store';

@Component({
  selector: 'app-customers',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  columns = ['name', 'email', 'phoneNumber', 'menu'];

  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  customers = this.customersStore.customers;
  count = this.customersStore.count!;
  take = this.customersStore.take!;

  ngOnInit(): void {
    this.customersStore.fetchCustomers({
      organizationId: this.organizationStore.organizaiton()?.organizationId!,
    });
  }
}
