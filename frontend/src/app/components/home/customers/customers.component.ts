import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { CustomersStore } from '../../../store/customers.store';
import { OrganizationStore } from '../../../store/organization.store';
import { CustomerDto } from '../../../../dtos/customer.dto';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { PaginationOptions } from '../../../types/PaginatedOptions';

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
    ReactiveFormsModule,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  columns = ['name', 'email', 'phoneNumber', 'menu'];
  isFilterApplied: boolean = false;
  searchControl = new FormControl('');
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });

  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  isLoading = this.customersStore.isLoading;

  customerDataSource = new MatTableDataSource<CustomerDto>();

  customers = this.customersStore.customers;
  count = this.customersStore.count!;
  take = this.customersStore.take!;

  constructor(private router: Router) {
    this.isFilterApplied = false;

      effect(() => {
        const customers = this.customersStore.customers();
        const { pageIndex, pageSize } = this.paginationOptions();
  
        const start = pageIndex * pageSize;
        const end = Math.min(start + pageSize, customers.length);
  
        this.customerDataSource.data = customers.slice(start, end);
      })
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({ pageIndex: event.pageIndex, pageSize: event.pageSize });

    this.customersStore.fetchCustomers({
      organizationId: this.organization()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
    });
  }

  ngOnInit(): void {
    this.customersStore.resetLoadedPages();

    this.customersStore.fetchCustomers({
      organizationId: this.organizationStore.organizaiton()?.organizationId!,
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.isFilterApplied = true;
        this.customersStore.fetchCustomers({
          organizationId:
            this.organizationStore.organizaiton()?.organizationId!,
          filter: {
            email: value?.trim()!,
          },
        });
      });
  }

  onAddCustomer() {
    this.router.navigate([
      `/${this.organization()?.organizationId}/customers/create`,
    ]);
  }

  onEditCustomer(customerId: string) {
    this.router.navigate([
      `/${this.organization()?.organizationId}/customers/${customerId}/edit`,
    ]);
  }
}
