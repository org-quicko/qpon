import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  CouponSummaryRow,
  CouponSummarySheet,
  CouponSummaryTable,
  CouponSummaryWorkbook,
} from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { EventEmitter, inject } from '@angular/core';
import { CouponService } from '../../../../../services/coupon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CouponDto } from '../../../../../../dtos/coupon.dto';
import { plainToInstance } from 'class-transformer';
import { statusEnum } from '../../../../../../enums';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';

export const OnCouponSuccess = new EventEmitter<boolean>();
export const OnCouponError = new EventEmitter<string>();

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
    data: new CouponSummaryWorkbook().getCouponSummarySheet().getCouponSummaryTable(),
    isLoading: false,
  },
};

export const CouponStore = signalStore(
  withState(initialState),
  withDevtools('coupon'),
  withMethods(
    (
      store,
      couponService = inject(CouponService),
      snackbarService = inject(SnackbarService)
    ) => ({
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
            return couponService.fetchCoupon(organizationId, couponId).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      coupon: {
                        data: plainToInstance(CouponDto, response.data!),
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

      fetchCouponSummary: rxMethod<{
        organizationId: string;
        couponId: string;
      }>(
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
                      const couponSummaryTable = plainToInstance(
                        CouponSummaryWorkbook,
                        response.data
                      ).getCouponSummarySheet().getCouponSummaryTable();

                      const updatedTable = Object.assign(new CouponSummaryTable(), couponSummaryTable);

                      patchState(store, {
                        couponStatistics: {
                          data: updatedTable,
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

      deactivateCoupon: rxMethod<{ organizationId: string; couponId: string }>(
        pipe(
          tap(() =>
            patchState(store, {
              coupon: { isLoading: true, data: store.coupon.data() },
            })
          ),
          concatMap(({ organizationId, couponId }) => {
            return couponService
              .deactivateCoupon(organizationId, couponId)
              .pipe(
                tapResponse({
                  next: (response) => {
                    if (response.code == 200) {
                      patchState(store, {
                        coupon: {
                          data: {
                            status: statusEnum.INACTIVE,
                          },
                          isLoading: false,
                        },
                      });
                    }
                  },
                  error: (error: any) => {
                    patchState(store, {
                      coupon: {
                        data: store.coupon.data(),
                        error: error.message,
                        isLoading: false,
                      },
                    });
                  },
                })
              );
          })
        )
      ),

      activateCoupon: rxMethod<{ organizationId: string; couponId: string }>(
        pipe(
          concatMap(({ organizationId, couponId }) => {
            return couponService.activateCoupon(organizationId, couponId).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      coupon: {
                        data: {
                          status: statusEnum.ACTIVE,
                        },
                        isLoading: false,
                      },
                    });
                  }
                },
                error: (error: any) => {
                  patchState(store, {
                    coupon: {
                      data: store.coupon.data(),
                      error: error.message,
                      isLoading: false,
                    },
                  });
                },
              })
            );
          })
        )
      ),

      deleteCoupon: rxMethod<{ organizationId: string; couponId: string }>(
        pipe(
          tap(() => {
            patchState(store, {
              coupon: {
                ...store.coupon(),
                isLoading: true,
              },
            });
          }),
          switchMap(({ organizationId, couponId }) => {
            return couponService.deleteCoupon(organizationId, couponId).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      coupon: {
                        data: null,
                        isLoading: false,
                      },
                    });

                    snackbarService.openSnackBar(
                      'Coupon successfully deleted',
                      undefined
                    );

                    OnCouponSuccess.emit(true);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    coupon: {
                      ...store.coupon(),
                      error: error.message,
                      isLoading: false,
                    },
                  });

                  snackbarService.openSnackBar(
                    'Error deleting coupon',
                    undefined
                  );

                  OnCouponError.emit(error.message);
                },
              })
            );
          })
        )
      ),
    })
  )
);
