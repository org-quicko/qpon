import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CouponCodeDto } from "../../../../../../../../dtos/coupon-code.dto";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { EventEmitter, inject } from "@angular/core";
import { CouponCodeService } from "../../../../../../../services/coupon-code.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";
import { HttpErrorResponse } from "@angular/common/http";
import { SnackbarService } from "../../../../../../../services/snackbar.service";
import { couponCodeStatusEnum, statusEnum } from "../../../../../../../../enums";

export const OnCouponCodeSuccess = new EventEmitter<boolean>();
export const OnCouponCodeError = new EventEmitter<string>();

export const onChangeStatusSuccess = new EventEmitter<boolean>();

type CouponCodeState = {
    couponCode: CouponCodeDto | null;
    isLoading: boolean | null;
    error: string | null;
}

const initialState: CouponCodeState = {
    couponCode: null,
    isLoading: null,
    error: null,
}

export const CouponCodeStore = signalStore(
    withState(initialState),
    withDevtools('coupon_code'),
    withMethods((store, couponCodeService = inject(CouponCodeService), snackbarService = inject(SnackbarService)) => ({
        fetchCouponCode: rxMethod<{ organizationId: string, couponId: string, campaignId: string, couponCodeId: string }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                concatMap(({ organizationId, couponId, campaignId, couponCodeId }) => {
                    return couponCodeService.fetchCouponCode(organizationId, couponId, campaignId, couponCodeId).pipe(
                        tapResponse({
                            next: (response) => {
                                if (response.code == 200) {
                                    patchState(store, {couponCode: plainToInstance(CouponCodeDto, response.data), isLoading: false});
                                }
                            },
                            error: (error: HttpErrorResponse) => {
                                patchState(store, {error: error.message, isLoading: false});
                            },
                        })
                    )
                })
            )
        ),

        deleteCouponCode: rxMethod<{ organizationId: string, couponId: string, campaignId: string, couponCodeId: string }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap(({ organizationId, couponId, campaignId, couponCodeId }) => {
                    return couponCodeService.deleteCouponCode(organizationId, couponId, campaignId, couponCodeId).pipe(
                        tapResponse({
                            next: (response) => {
                                if (response.code == 200) {
                                    patchState(store, {couponCode: null, isLoading: false});

                                    snackbarService.openSnackBar('Coupon code successfully deleted', undefined);

                                    OnCouponCodeSuccess.emit(true);
                                }
                            },
                            error: (error: HttpErrorResponse) => {
                                patchState(store, {error: error.message, isLoading: false});

                                snackbarService.openSnackBar('Error deleting coupon code', undefined);
                                
                                OnCouponCodeError.emit(error.message);
                            },
                        })
                    )
                })
            )
        ),

        activateCouponCode: rxMethod<{organizationId: string, couponId: string, campaignId: string, couponCodeId: string}>(
                    pipe(
                        switchMap(({organizationId, couponId, campaignId, couponCodeId}) => {
                            return couponCodeService.activateCouponCode(organizationId, couponId, campaignId, couponCodeId).pipe(
                                tapResponse({
                                    next: (response) => {
                                        if(response.code == 200) {
                                            const currentCouponCode = store.couponCode();

                                            const updatedCouponCode = {
                                                ...currentCouponCode,
                                                status: couponCodeStatusEnum.ACTIVE 
                                            }
        
                                            patchState(store, {couponCode: updatedCouponCode, isLoading: false})
        
                                            onChangeStatusSuccess.emit(true);
                                        }
                                    },
                                    error: (error:HttpErrorResponse) => {

                                        if(error.status === 409) {
                                            snackbarService.openSnackBar('Same coupon code is active elsewhere', undefined);
                                        }
                                        
                                        patchState(store, {isLoading: false, error: error.message})

                                        onChangeStatusSuccess.emit(false);
                                    }
                                })
                            )
                        })
                    )
                ),
        
                deactivateCouponCode: rxMethod<{organizationId: string, couponId: string, campaignId: string, couponCodeId: string}>(
                    pipe(
                        switchMap(({organizationId, couponId, campaignId, couponCodeId}) => {
                            return couponCodeService.deactivateCouponCode(organizationId, couponId, campaignId, couponCodeId).pipe(
                                tapResponse({
                                    next: (response) => {
                                        if(response.code == 200) {
                                            const currentCouponCode = store.couponCode();

                                            const updatedCouponCode = {
                                                ...currentCouponCode,
                                                status: couponCodeStatusEnum.INACTIVE 
                                            }
        
                                            patchState(store, {couponCode: updatedCouponCode, isLoading: false})
        
                                            onChangeStatusSuccess.emit(true);
                                        }
                                    },
                                    error: (error:HttpErrorResponse) => {

                                        patchState(store, {isLoading: false, error: error.message})

                                        onChangeStatusSuccess.emit(false);
                                    }
                                })
                            )
                        })
                    )
                ),
    }))
)