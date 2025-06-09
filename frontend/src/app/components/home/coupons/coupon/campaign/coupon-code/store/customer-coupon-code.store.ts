import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { EventEmitter, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerDto } from '../../../../../../../../dtos/customer.dto';
import { CustomerCouponCodeService } from '../../../../../../../services/customer-coupon-code.service';
import { CouponCodeService } from '../../../../../../../services/coupon-code.service';
import { PaginatedList } from '../../../../../../../../dtos/paginated-list.dto';
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
      couponCodeService = inject(CouponCodeService)
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
                    if (error.status == 404) {
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
    })
  )
);
