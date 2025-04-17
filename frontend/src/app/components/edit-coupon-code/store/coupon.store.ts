import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { CouponDto } from '../../../../dtos/coupon.dto';
import { CouponService } from '../../../services/coupon.service';
import { HttpErrorResponse } from '@angular/common/http';

type CouponState = {
  data: CouponDto | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CouponState = {
  data: null,
  isLoading: null,
  error: null,
};

export const CouponStore = signalStore(
  withState(initialState),
  withDevtools('coupon'),
  withMethods((store, couponService = inject(CouponService)) => ({
    fetchCoupon: rxMethod<{ organizationId: string; couponId: string }>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
          })
        ),
        switchMap(({ organizationId, couponId }) => {
          return couponService.fetchCoupon(organizationId, couponId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 200) {
                  patchState(store, {
                    data: plainToInstance(CouponDto, response.data!),
                    isLoading: false,
                    error: null,
                  });
                }
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, {
                  data: store.data(),
                  isLoading: false,
                  error: error.message,
                });
              },
            })
          );
        })
      )
    ),
  }))
);
