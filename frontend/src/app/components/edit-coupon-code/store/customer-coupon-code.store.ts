import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { EventEmitter, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerDto } from '../../../../dtos/customer.dto';
import { CustomerCouponCodeService } from '../../../services/customer-coupon-code.service';
import { PaginatedList } from '../../../../dtos/paginated-list.dto';
import { customerConstraintEnum } from '../../../../enums';
import { UpdateCouponCodeDto } from '../../../../dtos/coupon-code.dto';
import { UpdateCustomerCouponCodeDto } from '../../../../dtos/customer-coupon-code.dto';
import { CouponCodeService } from '../../../services/coupon-code.service';
import { SnackbarService } from '../../../services/snackbar.service';

export const onCustomerCouponCodeSuccess = new EventEmitter<boolean>(); 
export const onCustomerCouponCodeError = new EventEmitter<string>(); 

type CustomerCouponCodeState = {
  data: CustomerDto[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CustomerCouponCodeState = {
  data: null,
  isLoading: null,
  error: null,
};

export const CustomerCouponCodeStore = signalStore(
  withState(initialState),
  withDevtools('customer_coupon_code'),
  withMethods(
    (
      store,
      customerCouponCodeService = inject(CustomerCouponCodeService),
      couponCodeService = inject(CouponCodeService),
      snackbarService = inject(SnackbarService)
    ) => ({
      fetchCustomersForCouponCode: rxMethod<{
        couponId: string;
        campaignId: string;
        couponCodeId: string;
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              isLoading: true,
            })
          ),
          switchMap(({ couponId, campaignId, couponCodeId }) => {
            return customerCouponCodeService
              .fetchCustomers(couponId, campaignId, couponCodeId)
              .pipe(
                tapResponse({
                  next: (response) => {
                    if (response.code == 200) {
                      const customers = plainToInstance(
                        PaginatedList<CustomerDto>,
                        response.data
                      )
                        .getItems()
                        ?.map((customer) =>
                          plainToInstance(CustomerDto, customer)
                        );
                      patchState(store, {
                        data: customers,
                        isLoading: false,
                        error: null,
                      });
                    }
                  },
                  error: (error: HttpErrorResponse) => {
                    if(error.status == 404) {
                      patchState(store, {
                        data: [],
                        isLoading: false,
                        error: error.message,
                      });
                    } else {
                      patchState(store, {
                        data: store.data(),
                        isLoading: false,
                        error: error.message,
                      });
                    }
                  },
                })
              );
          })
        )
      ),

      configureCustomerCouponCode: rxMethod<{
        organizationId: string;
        couponId: string;
        campaignId: string;
        couponCodeId: string;
        customerConstraint: customerConstraintEnum;
        customers: string[];
      }>(
        pipe(
          tap(() => {
            patchState(store, {
              data: store.data(),
              isLoading: true,
              error: null,
            });
          }),
          switchMap(
            ({
              organizationId,
              couponId,
              campaignId,
              couponCodeId,
              customerConstraint,
              customers,
            }) => {
              const shouldModifyCustomers =
                customerConstraint === customerConstraintEnum.SPECIFIC;

              const updatedCouponCode = new UpdateCouponCodeDto();
              updatedCouponCode.customerConstraint = customerConstraint;

              let customerOperation$: Observable<any> = of(null);
              if (shouldModifyCustomers) {
                const updatedCustomerCouponCode =
                  new UpdateCustomerCouponCodeDto();
                updatedCustomerCouponCode.customers = customers;

                customerOperation$ = customerCouponCodeService.updateCustomers(
                  couponId,
                  campaignId,
                  couponCodeId,
                  instanceToPlain(updatedCustomerCouponCode)
                );
              }

              return forkJoin({
                updateCouponCode: couponCodeService.updateCouponCode(
                  organizationId,
                  couponId,
                  campaignId,
                  couponCodeId,
                  instanceToPlain(updatedCouponCode)
                ),
                customerOperation: customerOperation$,
              });
            }
          ),
          tapResponse({
            next: ({ updateCouponCode }) => {
              if (updateCouponCode.code == 200) {
                snackbarService.openSnackBar('Coupon code updated successfully', undefined);
                onCustomerCouponCodeSuccess.emit(true);
              }
            },
            error: (error: HttpErrorResponse) => {
              snackbarService.openSnackBar(
                'Error configuring customers',
                undefined
              );

              patchState(store, {
                data: store.data(),
                isLoading: false,
                error: error.message
              });

              onCustomerCouponCodeError.emit(error.message);
            },
          })
        )
      ),
    })
  )
);
