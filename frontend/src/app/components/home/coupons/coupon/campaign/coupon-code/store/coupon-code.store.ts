import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CouponCodeDto } from "../../../../../../../../dtos/coupon-code.dto";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { CouponCodeService } from "../../../../../../../services/coupon-code.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { concatMap, pipe, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";
import { HttpErrorResponse } from "@angular/common/http";

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
    withMethods((store, couponCodeService = inject(CouponCodeService)) => ({
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
        )
    }))
)