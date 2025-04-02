import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CouponSummaryRow, CouponSummarySheet, CouponSummaryTable, CouponSummaryWorkbook } from '../../../../../../generated/sources/coupon_summary_workbook';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { CouponService } from '../../../../../services/coupon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CouponDto } from '../../../../../../dtos/coupon.dto';
import { plainToClass } from 'class-transformer';

type CouponState = {
  coupon: {
    data: CouponDto | null;
    isLoading: boolean;
    error?: string;
  };
  couponStatistics: {
    data: CouponSummaryTable | null;
    isLoading: boolean;
    error?: string;
  };
};

const initialState: CouponState = {
  coupon: {
    data: null,
    isLoading: false,
  },
  couponStatistics: {
    data: null,
    isLoading: false,
  },
};

export const CouponStore = signalStore(
  withState(initialState),
  withDevtools('coupon'),
  withMethods((store, couponService = inject(CouponService)) => ({
    fetchCoupon: rxMethod<{ organizationId: string; couponId: string }>(
      pipe(
        tap(() =>
          patchState(store, {
            coupon: {
              ...store.coupon(),
              isLoading: true,
            },
          })
        ),
        concatMap(({ organizationId, couponId }) => {
          return couponService
            .fetchCoupon(organizationId, couponId)
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      coupon: {
                        data: plainToClass(CouponDto, response.data!),
                        isLoading: false,
                      },
                    });
                  }
                },
                error: (error: any) => {
                  patchState(store, {
                    coupon: {
                      ...store.coupon(),
                      isLoading: false,
                      error: error.message,
                    },
                  });
                },
              }),
              catchError((error) => {
                patchState(store, {
                  coupon: {
                    ...store.coupon(),
                    isLoading: false,
                    error: error.message,
                  },
                });
                return EMPTY;
              })
            );
        })
      )
    ),

    fetchCouponSummary: rxMethod<{ organizationId: string; couponId: string }>(
      pipe(
        tap(() =>
          patchState(store, {
            couponStatistics: {
              ...store.couponStatistics(),
              isLoading: true,
            },
          })
        ),
        concatMap(({ organizationId, couponId }) => {
          return couponService
            .fetchCouponSummary(organizationId, couponId)
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const couponSummarySheet = plainToClass(CouponSummaryWorkbook, response.data).getCouponSummarySheet()
                    const couponSummaryTable = plainToClass(CouponSummarySheet, couponSummarySheet).getCouponSummaryTable()
                    patchState(store, {
                      couponStatistics: {
                        data: couponSummaryTable,
                        isLoading: false,
                      },
                    });
                  }
                },
                error: (error: any) => {
                  patchState(store, {
                    couponStatistics: {
                      ...store.couponStatistics(),
                      isLoading: false,
                      error: error.message,
                    },
                  });
                },
              }),
              catchError((error) => {
                patchState(store, {
                  couponStatistics: {
                    ...store.couponStatistics(),
                    isLoading: false,
                    error: error.message,
                  },
                });
                return EMPTY;
              })
            );
        })
      )
    ),

    
  }))
);
