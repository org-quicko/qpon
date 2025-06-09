import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CustomerDto, UpdateCustomerDto } from '../../../../../dtos/customer.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { EventEmitter, inject } from '@angular/core';
import { CustomerService } from '../../../../services/customer.service';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../../services/snackbar.service';
import { plainToInstance } from 'class-transformer';

export const OnCustomerSuccess = new EventEmitter<boolean>();
export const onCustomerError = new EventEmitter<string>();

type CustomerState = {
  customer: CustomerDto | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: CustomerState = {
  customer: null,
  isLoading: false,
  error: null,
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
      fetchCustomer: rxMethod<{ organizationId: string; customerId: string }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(({ organizationId, customerId }) => {
            return customerService
              .fetchCustomer(organizationId, customerId)
              .pipe(
                tapResponse({
                  next: (response) => {
                    if(response.code == 200) {
                        patchState(store, {
                            isLoading: false,
                            customer: plainToInstance(CustomerDto, response.data),
                            error: null
                        })
                    }
                  },
                  error: (error: HttpErrorResponse) => {
                    patchState(store, {
                      isLoading: false,
                      error: error.message,
                    });

                    snackbarService.openSnackBar('Error fetching customer', undefined);
                  },
                })
              );
          })
        )
      ),

      updateCustomer: rxMethod<{organizationId: string, customerId: string, body: UpdateCustomerDto}>(
        pipe(
            tap(() => {
                patchState(store, {
                    isLoading: true
                })
            }),
            switchMap(({organizationId, customerId, body}) => {
                return customerService.updateCustomer(organizationId, customerId, body).pipe(
                    tapResponse({
                        next: (response) => {
                            if(response.code == 200) {
                                patchState(store, {
                                    isLoading: false,
                                    error: null,
                                    customer: plainToInstance(CustomerDto, response.data)
                                })

                                snackbarService.openSnackBar('Customer updated successfully', undefined);

                                OnCustomerSuccess.emit(true);
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            patchState(store, {
                                isLoading: false,
                                error: error.message
                            })

                            snackbarService.openSnackBar('Error updating the customer', undefined);

                            onCustomerError.emit(error.message);
                        }
                    })
                )
            })
        )
      )
    })
  )
);
