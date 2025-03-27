import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CouponDto } from '../../dtos/coupon.dto';
import { inject } from '@angular/core';
import { CouponService } from '../services/coupon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, skip, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToClass } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { statusEnum } from '../../enums';

type CouponsState = {
  coupons: CouponDto[];
  skip?: number | null;
  take?: number | null;
  count?: number | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CouponsState = {
  coupons: [],
  skip: null,
  take: null,
  count: null,
  isLoading: null,
  error: null,
};

export const CouponsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('coupons'),
  withState(initialState),
  withMethods((store, couponService = inject(CouponService)) => ({
    fetchCoupons: rxMethod<{ organizationId: string, skip?:number, take?: number }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, skip, take }) => {
          return couponService.fetchCoupons(organizationId, skip, take).pipe(
            tapResponse({
              next: (response) => {
                const couponList = plainToClass(
                  PaginatedList<CouponDto>,
                  response.data
                );
                patchState(store, {
                  coupons: couponList
                    .getItems()
                    ?.map((coupon) => plainToClass(CouponDto, coupon)),
                  skip: couponList?.getSkip(),
                  count: couponList?.getCount(),
                  take: couponList?.getTake(),
                  isLoading: false,
                });
              },
              error: (error: any) => {
                patchState(store, { isLoading: false, error: error.message });
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
