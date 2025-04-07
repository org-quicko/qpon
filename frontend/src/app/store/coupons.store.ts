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
import { CouponFilter } from '../types/coupon-filter.interface';
import { HttpErrorResponse } from '@angular/common/http';

type CouponsState = {
  coupons: CouponDto[];
  skip?: number | null;
  take?: number | null;
  count?: number | null;
  filter?: CouponFilter;
  isLoading: boolean | null;
  isSorting: boolean | null;
  error: string | null;
};

const initialState: CouponsState = {
  coupons: [],
  skip: null,
  take: null,
  count: null,
  filter: undefined,
  isLoading: null,
  isSorting: null,
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
      filter?: CouponFilter,
      isSortOperation?: boolean;
    }>(
      pipe(
        tap(({isSortOperation}) => {
          if (isSortOperation) {
            patchState(store, {isSorting: true});
          } else {
            patchState(store, {isLoading: true});
          }
        }),
        concatMap(({ organizationId, skip, take, filter }) => {
          return couponService
            .fetchCoupons(organizationId, skip, take, {
              ...filter,
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

    resetFilter: () => {
      patchState(store, {
        coupons: store.coupons(),
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
