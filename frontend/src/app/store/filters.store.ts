import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CouponCodeFilter } from "../types/coupon-code-filter.interface";
import { CouponFilter } from "../types/coupon-filter.interface";
import { ItemFilter } from "../types/item-filter.interface";
import { withDevtools } from "@angular-architects/ngrx-toolkit";

type FiltersState = {
    couponCodesFilter: CouponCodeFilter | null,
    couponFilter: CouponFilter | null,
    itemFilter: ItemFilter | null,
}

const initialState: FiltersState = {
    couponCodesFilter: null,
    couponFilter: null,
    itemFilter: null
}

export const FiltersStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withDevtools('filters'),
    withMethods((store) => ({
        setCouponCodeFilter: (filters: CouponCodeFilter | null) => {
            patchState(store, {
                couponCodesFilter: {...filters}
            })
        },

        setCouponFilter: (filters: CouponFilter | null) => {
            patchState(store, {
                couponFilter: {...filters}
            })
        },

        setItemFilter: (filters: ItemFilter | null) => {
            patchState(store, {
                itemFilter: {...filters}
            })
        },

        getCouponCodeFilter: () => {
            return store.couponCodesFilter;
        },

        getCouponFilter: () => {
            return store.couponFilter;
        },

        getItemFilter: () => {
            return store.itemFilter;
        },
    }))
)
