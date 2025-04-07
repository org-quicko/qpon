import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CouponCodeDto } from "../../../../../../../../dtos/coupon-code.dto";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { EventEmitter, inject } from "@angular/core";
import { CouponCodeService } from "../../../../../../../services/coupon-code.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";
import { PaginatedList } from "../../../../../../../../dtos/paginated-list.dto";
import { HttpErrorResponse } from "@angular/common/http";
import { CouponCodeFilter } from "../../../../../../../types/coupon-code-filter.interface";
import { statusEnum } from "../../../../../../../../enums";

type CouponCodesState = {
    couponCodes: CouponCodeDto[] | null;
    skip: number | null,
    take: number | null,
    count: number | null,
    filter?: CouponCodeFilter,
    isLoading: boolean | null;
    isSorting: boolean | null;
    error: string | null;
}

const initialState: CouponCodesState = {
    couponCodes: null,
    count: null,
    skip: null,
    take: null,
    isLoading: null,
    isSorting: null,
    error: null,
}

export const onChangeStatusSuccess = new EventEmitter<boolean>();

export const CouponCodesStore = signalStore(
    withState(initialState),
    withDevtools('coupon_codes'),
    withMethods((store, couponCodeService = inject(CouponCodeService)) => ({
        fetchCouponCodes: rxMethod<{organizationId: string, couponId: string, campaignId: string, skip?: number, take?: number, filter?: CouponCodeFilter, isSortOperation?: boolean}>(
            pipe(
                tap(({isSortOperation}) => {
                    if (isSortOperation) {
                      patchState(store, {isSorting: true});
                    } else {
                      patchState(store, {isLoading: true});
                    }
                  }),
                switchMap(({organizationId, couponId, campaignId, skip, take, filter}) => {
                    return couponCodeService.fetchCouponCodes(organizationId, couponId, campaignId, filter, skip, take).pipe(
                        tapResponse({
                            next: (response) => {
                                if(response.code == 200) {
                                    const couponCodeList = plainToInstance(PaginatedList<CouponCodeDto>, response.data);
                                    patchState(store, {couponCodes: couponCodeList.getItems()?.map((couponCode) => plainToInstance(CouponCodeDto, couponCode)), isLoading: false, skip: couponCodeList.getSkip(), take: couponCodeList.getTake(), count: couponCodeList.getCount()})
                                }
                            },
                            error: (error: HttpErrorResponse) => {
                                if(error.status == 404) {
                                    patchState(store, {isLoading: false, couponCodes: []})                                    
                                }
                                patchState(store, {isLoading: false, error: error.message})
                            }
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
                                    const updatedCouponCodes = store.couponCodes()?.map((couponCode) => {
                                        if(couponCode.couponCodeId == couponCodeId) {
                                            couponCode.status = statusEnum.ACTIVE;
                                        }
                                        return couponCode;
                                    })

                                    patchState(store, {couponCodes: updatedCouponCodes, isLoading: false, skip: store.skip(), take: store.take(), count: store.count()})

                                    onChangeStatusSuccess.emit(true);
                                }
                            },
                            error: (error:any) => {
                                patchState(store, {couponCodes: store.couponCodes(), isLoading: false, skip: store.skip(), take: store.take(), count: store.count(), error: error.message})
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
                                    const updatedCouponCodes = store.couponCodes()?.map((couponCode) => {
                                        if(couponCode.couponCodeId == couponCodeId) {
                                            couponCode.status = statusEnum.INACTIVE;
                                        }
                                        return couponCode;
                                    })

                                    patchState(store, {couponCodes: updatedCouponCodes, isLoading: false, skip: store.skip(), take: store.take(), count: store.count()})

                                    onChangeStatusSuccess.emit(true);
                                }
                            },
                            error: (error:any) => {
                                patchState(store, {couponCodes: store.couponCodes(), isLoading: false, skip: store.skip(), take: store.take(), count: store.count(), error: error.message})
                            }
                        })
                    )
                })
            )
        )
    }))
)