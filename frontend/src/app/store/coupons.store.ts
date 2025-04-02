import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CouponDto } from '../../dtos/coupon.dto';
import { inject } from '@angular/core';
import { CouponService } from '../services/coupon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  of,
  pipe,
  shareReplay,
  skip,
  switchMap,
  tap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToClass } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import {
  discountTypeEnum,
  itemConstraintEnum,
  sortOrderEnum,
  statusEnum,
} from '../../enums';
import { CouponFilter } from '../interfaces/coupon-filter.interface';
import { HttpErrorResponse } from '@angular/common/http';

type CouponsState = {
  coupons: CouponDto[];
  filteredCoupons: CouponDto[];
  skip?: number | null;
  take?: number | null;
  count?: number | null;
  filter?: CouponFilter;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CouponsState = {
  coupons: [],
  filteredCoupons: [],
  skip: null,
  take: null,
  count: null,
  filter: undefined,
  isLoading: null,
  error: null,
};

export const CouponsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('coupons'),
  withState(initialState),
  withMethods((store, couponService = inject(CouponService)) => ({
    fetchCoupons: rxMethod<{
      organizationId: string;
      skip?: number;
      take?: number;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, skip, take }) => {
          return couponService
            .fetchCoupons(organizationId, skip, take, {
              sortBy: 'createdAt',
              sortOrder: sortOrderEnum.DESC,
            })
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const couponList = plainToClass(
                      PaginatedList<CouponDto>,
                      response.data
                    );

                    const coupons = couponList
                      .getItems()
                      ?.map((coupon) => plainToClass(CouponDto, coupon));
                    patchState(store, {
                      coupons: coupons,
                      filteredCoupons: coupons,
                      skip: couponList?.getSkip(),
                      count: couponList?.getCount(),
                      take: couponList?.getTake(),
                      isLoading: false,
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      coupons: [],
                      isLoading: false,
                    });
                  } else {
                    patchState(store, {
                      isLoading: false,
                      error: error.message,
                    });
                  }
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

    fetchCouponsByFilter: rxMethod<{
      organizationId: string;
      skip?: number;
      take?: number;
      filter?: CouponFilter;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, skip, take, filter }) => {
          return couponService
            .fetchCoupons(organizationId, skip, take, filter)
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const couponList = plainToClass(
                      PaginatedList<CouponDto>,
                      response.data
                    );

                    const coupons = couponList
                      .getItems()
                      ?.map((coupon) => plainToClass(CouponDto, coupon));
                    patchState(store, {
                      coupons: store.coupons(),
                      filteredCoupons: coupons,
                      skip: couponList?.getSkip(),
                      count: couponList?.getCount(),
                      take: couponList?.getTake(),
                      isLoading: false,
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      coupons: store.coupons(),
                      filteredCoupons: [],
                      count: 0,
                      isLoading: false,
                    });
                  } else {
                    patchState(store, {
                      isLoading: false,
                      error: error.message,
                    });
                  }
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

    resetFilter: () => {
      patchState(store, {
        filteredCoupons: store.coupons(),
        count: store.coupons().length,
      });
    },

    deactivateCoupon: rxMethod<{ organizationId: string; couponId: string }>(
      pipe(
        concatMap(({ organizationId, couponId }) => {
          return couponService.deactivateCoupon(organizationId, couponId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 200) {
                  patchState(store, {
                    coupons: store
                      .coupons()
                      .map((coupon) =>
                        coupon.couponId == couponId
                          ? { ...coupon, status: statusEnum.INACTIVE }
                          : coupon
                      ),
                  });
                }
              },
              error: (error: any) => {
                patchState(store, { error: error.message });
              },
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return EMPTY;
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
                    coupons: store
                      .coupons()
                      .map((coupon) =>
                        coupon.couponId == couponId
                          ? { ...coupon, status: statusEnum.ACTIVE }
                          : coupon
                      ),
                  });
                }
              },
              error: (error: any) => {
                patchState(store, { error: error.message });
              },
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return EMPTY;
            })
          );
        })
      )
    ),
  }))
);
