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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
    CommonModule,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit, AfterViewInit {
  columns = ['name', 'email', 'phoneNumber', 'menu'];
  isFilterApplied: boolean = false;
  searchControl = new FormControl('');

  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  isLoading = this.customersStore.isLoading;

  customerDataSource = new MatTableDataSource<CustomerDto>()

  @ViewChild(MatPaginator) paginator!: MatPaginator

  customers = this.customersStore.customers;
  count = this.customersStore.count!;
  take = this.customersStore.take!;

  constructor() {
    this.isFilterApplied = false;
  }

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


    this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.isFilterApplied = true;
      this.customersStore.fetchCustomers({
        organizationId: this.organizationStore.organizaiton()?.organizationId!,
        filter: {
          email: value?.trim()!,
        },
      })
    });
  }
}
