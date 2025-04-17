import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, shareReplay, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToClass, plainToInstance } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerService } from '../../../services/customer.service';
import { CustomerDto } from '../../../../dtos/customer.dto';
import { PaginatedList } from '../../../../dtos/paginated-list.dto';

type CustomersState = {
  customers: CustomerDto[];
  skip?: number | null,
  take?: number | null,
  count?: number | null,
  isLoading: boolean;
  filter: { query: string } | null;
  error: string | null;
};

const initialState: CustomersState = {
  customers: [],
  skip: null,
  take: null,
  count: null,
  isLoading: false,
  filter: null,
  error: null,
};

export const CustomersStore = signalStore(
  withDevtools('customers'),
  withState(initialState),
  withMethods((store, customerService = inject(CustomerService)) => ({
    fetchCustomers: rxMethod<{ organizationId: string, skip?:number, take?: number, filter?: {email: string} }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ organizationId, skip, take, filter }) => {
          return customerService.fetchCustomers(organizationId, skip, take, filter).pipe(
            tapResponse({
              next: (response) => {
                const customerList = plainToInstance(PaginatedList<CustomerDto>, response.data) ;
                patchState(store, {
                  customers: customerList.getItems()?.map((customer) => plainToInstance(CustomerDto, customer)),
                  skip: customerList?.getSkip(),
                  count: customerList?.getCount(),
                  take: customerList?.getTake(),
                  isLoading: false,
                });
              },
              error: (error: HttpErrorResponse) => {
                if(error.status === 404) {
                  patchState(store, { customers: [], isLoading: false });
                } else {
                  patchState(store, { isLoading: false, error: error.message });
                }
              },
            }),
          );
        })
      )
    ),
  }))
);
