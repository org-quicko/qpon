import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CustomerService } from '../services/customer.service';
import { catchError, concatMap, EMPTY, of, pipe, shareReplay, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CustomerDto } from '../../dtos/customer.dto';
import { plainToClass } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { HttpErrorResponse } from '@angular/common/http';

type CustomersState = {
  customers: CustomerDto[];
  skip?: number | null;
  take?: number | null;
  count?: number | null;
  isLoading: boolean;
  loadedPages: Set<number>;
  error: string | null;
};

const initialState: CustomersState = {
  customers: [],
  skip: null,
  take: null,
  count: null,
  isLoading: false,
  loadedPages: new Set<number>(),
  error: null,
};

export const CustomersStore = signalStore(
  { providedIn: 'root' },
  withDevtools('customers'),
  withState(initialState),
  withMethods((store, customerService = inject(CustomerService)) => ({
    fetchCustomers: rxMethod<{
      organizationId: string;
      skip?: number;
      take?: number;
      filter?: { email: string };
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, skip, take, filter }) => {
          const page = Math.floor((skip ?? 0) / (take ?? 10));

          if (store.loadedPages().has(page) && !filter) {
            patchState(store, { isLoading: false });
            return of(store.customers());
          }

          return customerService
            .fetchCustomers(organizationId, skip, take, filter)
            .pipe(
              tapResponse({
                next: (response) => {
                  const customerList = plainToClass(
                    PaginatedList<CustomerDto>,
                    response.data
                  );

                  const customers = customerList
                    .getItems()
                    ?.map((customer) => plainToClass(CustomerDto, customer));

                  const updatedPages = store.loadedPages().add(page);
                  const currentCustomers = store.customers() ?? [];
                  let updatedCustomers: CustomerDto[] = [];

                  if (filter) {
                    updatedCustomers = customers!;
                  } else {
                    updatedCustomers = [...currentCustomers, ...customers!];
                  }

                  patchState(store, {
                    customers: updatedCustomers,
                    skip: customerList?.getSkip(),
                    count: customerList?.getCount(),
                    take: customerList?.getTake(),
                    loadedPages: updatedPages,
                    isLoading: false,
                  });
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status === 404) {
                    patchState(store, {
                      customers: [],
                      isLoading: false,
                      loadedPages: new Set(),
                      count: 0,
                    });
                  } else {
                    patchState(store, {
                      isLoading: false,
                      error: error.message,
                    });
                  }
                },
              }),
            );
        })
      )
    ),

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set(),
      });
    },
  }))
);
