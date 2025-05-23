import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CouponDto } from '../../dtos/coupon.dto';
import { EventEmitter, inject } from '@angular/core';
import { CouponService } from '../services/coupon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, of, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { sortOrderEnum, statusEnum } from '../../enums';
import { CouponFilter } from '../types/coupon-filter.interface';
import { HttpErrorResponse } from '@angular/common/http';

export const OnCouponsSuccess = new EventEmitter<boolean>();
export const OnCouponsError = new EventEmitter<string>();

type CouponsState = {
  coupons: CouponDto[];
  skip?: number | null;
  take?: number | null;
  count?: number | null;
  filter?: CouponFilter;
  loadedPages: Set<number>;
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
  loadedPages: new Set<number>(),
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
      filter?: CouponFilter;
      sortOptions?: {sortBy: string, sortOrder: sortOrderEnum},
      isSortOperation?: boolean;
      isFilterOperation?: boolean;
    }>(
      pipe(
        tap(({ isSortOperation, isFilterOperation }) => {
          if (isSortOperation) {
            // Clear everything when sorting
            patchState(store, {
              isSorting: true,
              isLoading: true,
              coupons: [],
              loadedPages: new Set<number>(),
            });
          } else if (isFilterOperation) {
            patchState(store, { isLoading: false });
          } else {
            patchState(store, { isLoading: true });
          }
        }),
        concatMap(({ organizationId, skip, take, filter, isSortOperation, sortOptions, isFilterOperation }) => {
          const page = Math.floor((skip ?? 0) / (take ?? 10));

          // Skip if page already loaded and not sorting
          if (store.loadedPages().has(page) && !isSortOperation && !isFilterOperation) {
            patchState(store, { isLoading: false });
            return of(store.coupons());
          }

          return couponService
            .fetchCoupons(organizationId, skip, take, filter, sortOptions)
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const couponList = plainToInstance(
                      PaginatedList<CouponDto>,
                      response.data
                    );

                    const currentCoupons = store.coupons() ?? [];
                    const updatedPages = store.loadedPages().add(page);
                    const coupons =
                      couponList
                        .getItems()
                        ?.map((coupon) => plainToInstance(CouponDto, coupon)) ||
                      [];

                    let updatedCoupons: CouponDto[];

                    // If sorting or first load, replace all data
                    if (isSortOperation || isFilterOperation)  {
                      updatedCoupons = [...coupons];
                    } else {  
                      // For pagination, merge without duplicates based on ID
                      // const existingIds = new Set(currentCoupons.map(c => c.couponId));
                      // const newCoupons = coupons.filter(c => !existingIds.has(c.couponId));
                      updatedCoupons = [...currentCoupons, ...coupons];
                    }

                    patchState(store, {
                      coupons: updatedCoupons,
                      skip: couponList?.getSkip(),
                      count: couponList?.getCount(),
                      take: couponList?.getTake(),
                      isLoading: false,
                      isSorting: false,
                      loadedPages: updatedPages,
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      coupons: [],
                      isLoading: false,
                      isSorting: false,
                      count: 0,
                      loadedPages: new Set()
                    });
                  } else {
                    patchState(store, {
                      coupons: [],
                      isLoading: false,
                      isSorting: false,
                      error: error.message,
                    });
                  }
                },
              }),
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

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set<number>(),
      });
    },

    resetCoupons() {
      patchState(store, {
        count: null,
        coupons: []
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

                  OnCouponsSuccess.emit(true);
                }
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, { error: error.message, isLoading: false });
                 OnCouponsError.emit(error.message)
              },
            }),
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

                  OnCouponsSuccess.emit(true);
                }
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, { error: error.message, isLoading: false });
                OnCouponsError.emit(error.message)
              },
            }),
          );
        })
      )
    ),
  }))
);
