import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CustomersStore } from '../../../store/customers.store';
import { OrganizationStore } from '../../../store/organization.store';
import { CustomerDto } from '../../../../dtos/customer.dto';

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
export class CustomersComponent implements OnInit, AfterViewInit {
  columns = ['name', 'email', 'phoneNumber', 'menu'];

  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;

  customerDataSource = new MatTableDataSource<CustomerDto>()

  @ViewChild(MatPaginator) paginator!: MatPaginator

  customers = this.customersStore.customers;
  count = this.customersStore.count!;
  take = this.customersStore.take!;

  ngAfterViewInit(): void {
    this.customerDataSource.paginator = this.paginator;
  }

  
  onPageChange(event: PageEvent) {
    this.customersStore.fetchCustomers({
      organizationId: this.organization()?.organizationId!,
      skip: (event.pageIndex) * event.pageSize,
      take: event.pageSize
    })
  }

  ngOnInit(): void {
    this.customersStore.fetchCustomers({
      organizationId: this.organizationStore.organizaiton()?.organizationId!,
    });
  }
}
