import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CustomerService } from '../services/customer.service';
import { catchError, concatMap, EMPTY, pipe, shareReplay, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CustomerDto } from '../../dtos/customer.dto';
import { plainToClass } from 'class-transformer';

type CustomersState = {
  customers: CustomerDto[];
  isLoading: boolean;
  filter: { query: string } | null;
  error: string | null;
};

const initialState: CustomersState = {
  customers: [],
  isLoading: false,
  filter: null,
  error: null,
};

export const CustomersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, customerService = inject(CustomerService)) => ({
    fetchCustomers: rxMethod<{ organizationId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId }) => {
          return customerService.fetchCustomers(organizationId).pipe(
            tapResponse({
              next: (response) => {
                const customers = response.data;
                patchState(store, {
                  customers: customers?.map((customer) => plainToClass(CustomerDto, customer)),
                  isLoading: false,
                });
              },
              error: (error: any) => {
                patchState(store, { isLoading: false, error: error.message });
              },
            }),
            catchError((error) => {
              patchState(store, { isLoading: false, error: error.message });
              return EMPTY;
            })
          );
        })
      )
    ),
  }))
);
