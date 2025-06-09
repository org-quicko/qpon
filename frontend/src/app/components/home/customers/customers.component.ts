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
import { CustomersStore, OnCustomerSuccess } from '../../../store/customers.store';
import { OrganizationStore } from '../../../store/organization.store';
import { CreateCustomerDto, CustomerDto, UpdateCustomerDto } from '../../../../dtos/customer.dto';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { PaginationOptions } from '../../../types/PaginatedOptions';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteCustomerDialogComponent } from './delete-customer-dialog/delete-customer-dialog.component';
import { UserAbility, UserAbilityTuple } from '../../../permissions/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { PureAbility } from '@casl/ability';
import { NotAllowedDialogBoxComponent } from '../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';

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
    MatDialogModule,
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

  dialog = inject(MatDialog);
  customersStore = inject(CustomersStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  isLoading = this.customersStore.isLoading;

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

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
    this.customersStore.resetCustomers();

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
          isFilterApplied: true
        });
      });

      OnCustomerSuccess.subscribe((res) => {
        if(res) {
          this.dialog.closeAll();
          this.customersStore.resetCustomers();
          this.paginationOptions.set({
            pageIndex: 0,
            pageSize: 10
          })
          this.ngOnInit()
        }
      })
  }

  onAddCustomer() {
    if(this.can('create', CreateCustomerDto)) {
      this.router.navigate([
        `/${this.organization()?.organizationId}/customers/create`,
      ]);
    } else {
      const rule = this.ability.relevantRuleFor('create', CreateCustomerDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  
	openNotAllowedDialogBox(restrictionReason: string) {
		this.dialog.open(NotAllowedDialogBoxComponent, {
			data: {
				description: restrictionReason,
			}
		});
	}

  onEditCustomer(customerId: string) {
    if(this.can('update', UpdateCustomerDto)) {
      this.router.navigate([
        `/${this.organization()?.organizationId}/customers/${customerId}/edit`,
      ]);
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCustomerDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openDeleteDialog(customer: CustomerDto) {
    if(this.can('delete', CustomerDto)) {
      this.dialog.open(DeleteCustomerDialogComponent, {
        autoFocus: false,
        data: {
          onDelete: this.customersStore.deleteCustomer,
          customer: customer,
          organizationId: this.organization()?.organizationId
        }
      })
    } else {
      const rule = this.ability.relevantRuleFor('delete', CustomerDto);
      this.openNotAllowedDialogBox(rule?.reason!)
    }
  }
}
