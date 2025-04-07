import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ItemDto } from '../../../../../../../../dtos/item.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { EligibleItemsService } from '../../../../../../../services/eligible-items.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { PaginatedList } from '../../../../../../../../dtos/paginated-list.dto';
import { HttpErrorResponse } from '@angular/common/http';

type EligibleItemsState = {
  items: ItemDto[] | null;
  skip?: number | null;
  take?: number | null;
  isLoading: boolean | null;
  error: string | null;
};


const initialState: EligibleItemsState = {
    items: null,
    isLoading: null,
    error: null,
}

export const EligibleItemsStore = signalStore(
    withState(initialState),
    withDevtools('eligible_items'),
    withMethods((store, eligibleItemService = inject(EligibleItemsService)) => ({
        fetchItems: rxMethod<{organizationId: string, couponId: string, filter?: {name: string}}>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({organizationId, couponId, filter}) => {
                    return eligibleItemService.fetchItemsForCoupon(organizationId, couponId, filter).pipe(
                        tapResponse({
                            next: (response) => {
                                if(response.code == 200) {
                                    const items = plainToInstance(PaginatedList<ItemDto>, response.data).getItems();
                                    patchState(store, {isLoading: false, items: items})
                                }
                            },
                            error: (error:HttpErrorResponse) => {
                                if(error.status === 404) {
                                    patchState(store, { items: [], isLoading: false });
                                } else {
                                    patchState(store, { isLoading: false, error: error.message })
                                }
                            }
                        })
                    )
                })
            )
        )
    }))
)