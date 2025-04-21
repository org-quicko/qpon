import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  CreateCustomerDto,
  CustomerDto,
} from '../../../../../dtos/customer.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, from, pipe, switchMap, tap, toArray } from 'rxjs';
import { EventEmitter, inject } from '@angular/core';
import { CustomerService } from '../../../../services/customer.service';
import { instanceToPlain } from 'class-transformer';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../../services/snackbar.service';

export const OnCustomerSuccess = new EventEmitter<boolean>();
export const onCustomerError = new EventEmitter<string>();

type CustomerState = {
  customer: CreateCustomerDto | null;
  customers: CreateCustomerDto[] | null;
  isLoading: boolean;
  error: string | null;
  onNext: boolean;
  onBack: boolean;
  currentStep: number;
  toalSteps: number;
};

const initialState: CustomerState = {
  customer: null,
  customers: null,
  isLoading: false,
  error: null,
  onNext: false,
  onBack: false,
  currentStep: 0,
  toalSteps: 2,
};

export const CustomerStore = signalStore(
  withState(initialState),
  withDevtools('customer'),
  withMethods(
    (
      store,
      customerService = inject(CustomerService),
      snackbarService = inject(SnackbarService)
    ) => ({
      setOnNext() {
        patchState(store, {
          onNext: !store.onNext(),
        });
      },

      setOnBack() {
        patchState(store, {
          onBack: !store.onBack(),
        });
      },

      setCustomer(customer: CreateCustomerDto) {
        const customers = store.customers() ?? [];

        const existingIndex = customers.findIndex(
          (it) => it.name?.toLowerCase() === customer.name?.toLowerCase()
        );

        let updatedCustomers: CreateCustomerDto[];

        if (existingIndex !== -1) {
          updatedCustomers = [...customers];
          updatedCustomers[existingIndex] = customer;
        } else {
          updatedCustomers = [...customers, customer];
        }

        patchState(store, {
          customer: customer,
          customers: updatedCustomers,
        });
      },

      resetCustomer() {
        patchState(store, {
          customer: null,
        });
      },

      resetCurrentStep() {
        patchState(store, {
          currentStep: 0,
        });
      },

      nextStep() {
        patchState(store, {
          currentStep: Math.min(store.currentStep() + 1, store.toalSteps() - 1),
        });
      },

      previousStep() {
        patchState(store, {
          currentStep: Math.max(store.currentStep() - 1, 0),
        });
      },

      createCustomer: rxMethod<{
        organizationId: string;
        customers: CreateCustomerDto[];
      }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(({ organizationId, customers }) => {
            return from(customers).pipe(
              concatMap((customer) =>
                customerService.createCustomer(
                  organizationId,
                  instanceToPlain(customer)
                )
              ),
              toArray(),
              tapResponse({
                next: () => {
                  patchState(store, {
                    isLoading: false,
                    customers: null,
                    customer: null,
                  });

                  snackbarService.openSnackBar('Customers created successfully', undefined);

                  OnCustomerSuccess.emit(true);
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });

                  snackbarService.openSnackBar('Error creating customers', undefined);

                  onCustomerError.emit(error.message);
                },
              })
            );
          })
        )
      ),
    })
  )
);
