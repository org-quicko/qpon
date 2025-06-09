import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { EventEmitter, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import {
  CouponCodeDto,
  UpdateCouponCodeDto,
} from '../../../../dtos/coupon-code.dto';
import { CouponCodeService } from '../../../services/coupon-code.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../services/snackbar.service';

export const onCouponCodeSuccess = new EventEmitter<boolean>();
export const onCouponCodeError = new EventEmitter<string>();

type CouponCodeState = {
  data: CouponCodeDto | null;
  isLoading: boolean | null;
  error: string | null;
  onNext: boolean;
  onBack: boolean;
};

const initialState: CouponCodeState = {
  data: null,
  isLoading: null,
  error: null,
  onNext: false,
  onBack: false,
};

export const CouponCodeStore = signalStore(
  withState(initialState),
  withDevtools('coupon_code'),
  withMethods((store, couponCodeService = inject(CouponCodeService), snackbarService = inject(SnackbarService)) => ({
    fetchCouponCode: rxMethod<{
      organizationId: string;
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
        switchMap(({ organizationId, couponId, campaignId, couponCodeId }) => {
          return couponCodeService
            .fetchCouponCode(organizationId, couponId, campaignId, couponCodeId)
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      data: plainToInstance(CouponCodeDto, response.data!),
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

    setOnNext: () => {
      patchState(store, {
        onNext: !store.onNext(),
      });
    },

    setOnBack: () => {
      patchState(store, {
        onBack: !store.onBack(),
      });
    },

    setCouponCode(couponCode: CouponCodeDto) {
      patchState(store, {
        data: couponCode,
        isLoading: store.isLoading(),
        error: store.error(),
      });
    },

    updateCouponCode: rxMethod<{
      organizationId: string;
      couponId: string;
      campaignId: string;
      couponCodeId: string;
      body: UpdateCouponCodeDto;
    }>(
      pipe(
        tap(() => {
          patchState(store, {
            data: store.data(),
            isLoading: true,
            error: null,
          });
        }),
        switchMap(({ organizationId, couponId, campaignId, couponCodeId, body }) => {
          return couponCodeService.updateCouponCode(organizationId, couponId, campaignId, couponCodeId, body).pipe(
            tapResponse({
              next: (response) => {
                if(response.code == 200) {
                  patchState(store, {
                    data: plainToInstance(CouponCodeDto, response.data),
                    isLoading: false,
                    error: null
                  })

                  snackbarService.openSnackBar('Coupon code details updated', undefined);

                  onCouponCodeSuccess.emit(true);
                }
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, {
                  data: store.data(),
                  isLoading: false,
                  error: error.message
                })

                snackbarService.openSnackBar("Error updating the coupon code", undefined);

                onCouponCodeError.emit(error.message);
              }
            })
          )
        })
      )
    ),
  }))
);
