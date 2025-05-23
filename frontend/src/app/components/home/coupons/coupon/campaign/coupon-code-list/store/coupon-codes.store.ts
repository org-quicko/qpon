import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CouponCodeDto } from "../../../../../../../../dtos/coupon-code.dto";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { EventEmitter, inject } from "@angular/core";
import { CouponCodeService } from "../../../../../../../services/coupon-code.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { of, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";
import { PaginatedList } from "../../../../../../../../dtos/paginated-list.dto";
import { HttpErrorResponse } from "@angular/common/http";
import { CouponCodeFilter } from "../../../../../../../types/coupon-code-filter.interface";
import { couponCodeStatusEnum, sortOrderEnum, statusEnum } from "../../../../../../../../enums";
import { SnackbarService } from "../../../../../../../services/snackbar.service";

type CouponCodesState = {
    couponCodes: CouponCodeDto[] | null;
    count: number | null,
    filter?: CouponCodeFilter,
    isLoading: boolean | null;
    isSorting: boolean | null;
    loadedPages: Set<number>;
    error: string | null;
}

const initialState: CouponCodesState = {
    couponCodes: null,
    count: null,
    isLoading: null,
    isSorting: null,
    loadedPages: new Set(),
    error: null,
}

export const onChangeStatusSuccess = new EventEmitter<boolean>();

export const CouponCodesStore = signalStore(
    withState(initialState),
    withDevtools('coupon_codes'),
    withMethods((store, couponCodeService = inject(CouponCodeService), snackbarService = inject(SnackbarService)) => ({
        fetchCouponCodes: rxMethod<{organizationId: string, couponId: string, campaignId: string, skip?: number, take?: number, filter?: CouponCodeFilter, sortOptions?: {  sortBy: string
          sortOrder: sortOrderEnum}, isSortOperation?: boolean, isFilterOperation?: boolean}>(
            pipe(
                tap(({isSortOperation}) => {
                    if (isSortOperation) {
                      patchState(store, {isSorting: true});
                    } else {
                      patchState(store, {isLoading: true});
                    }
                  }),
                switchMap(({organizationId, couponId, campaignId, skip, take, filter, sortOptions, isSortOperation, isFilterOperation}) => {

                    const page = Math.floor((skip ?? 0)/(take ?? 10));

                    if(store.loadedPages().has(page) && !isSortOperation && !isFilterOperation) {
                        patchState(store, { isLoading: false });
                        return of(store.couponCodes());
                    }

                    return couponCodeService.fetchCouponCodes(organizationId, couponId, campaignId, filter, sortOptions,  skip, take).pipe(
                        tapResponse({
                            next: (response) => {
                                if(response.code == 200) {
                                    const couponCodeList = plainToInstance(PaginatedList<CouponCodeDto>, response.data);
                                    const couponCodes = couponCodeList.getItems()?.map((couponCode) => plainToInstance(CouponCodeDto, couponCode)) ?? [];

                                    const currentCoupnCodes =  store.couponCodes() ?? [];
                                    let updatedCouponCodes = [];

                                    const updatedPages = store.loadedPages().add(page);

                                    if(isSortOperation || isFilterOperation) {
                                        updatedCouponCodes = [...couponCodes];
                                    } else {
                                        updatedCouponCodes = [...currentCoupnCodes, ...couponCodes]
                                    }

                                    patchState(store, {couponCodes: updatedCouponCodes, loadedPages: updatedPages, isLoading: false, count: couponCodeList.getCount()})
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
                                            couponCode.status = couponCodeStatusEnum.ACTIVE;
                                        }
                                        return couponCode;
                                    })

                                    patchState(store, {couponCodes: updatedCouponCodes, isLoading: false, count: store.count()})

                                    onChangeStatusSuccess.emit(true);
                                }
                            },
                            error: (error:HttpErrorResponse) => {

                                if(error.status === 409) {
                                    snackbarService.openSnackBar('Same coupon code is active elsewhere', undefined);
                                }

                                onChangeStatusSuccess.emit(false);

                                patchState(store, {error: error.message})
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
                                            couponCode.status = couponCodeStatusEnum.INACTIVE;
                                        }
                                        return couponCode;
                                    })

                                    patchState(store, {couponCodes: updatedCouponCodes, isLoading: false, count: store.count()})

                                    onChangeStatusSuccess.emit(true);
                                }
                            },
                            error: (error:any) => {
                                patchState(store, {couponCodes: store.couponCodes(), isLoading: false, count: store.count(), error: error.message})
                                onChangeStatusSuccess.emit(false);
                            }
                        })
                    )
                })
            )
        ),

        resetLoadedPages() {
            patchState(store, {
                loadedPages: new Set()
            });
        },

        resetCouponCodes() {
            patchState(store, {
                couponCodes: null,
                count: null,
            })
        }
    }))
)