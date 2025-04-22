import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ItemDto } from '../../../../../../../../dtos/item.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { EligibleItemsService } from '../../../../../../../services/eligible-items.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { PaginatedList } from '../../../../../../../../dtos/paginated-list.dto';
import { HttpErrorResponse } from '@angular/common/http';

type EligibleItemsState = {
  items: ItemDto[] | null;
  count: number | null;
  isLoading: boolean | null;
  loadedPages: Set<number>;
  error: string | null;
};


const initialState: EligibleItemsState = {
    items: null,
    isLoading: null,
    count: null,
    loadedPages: new Set<number>(),
    error: null,
}

export const EligibleItemsStore = signalStore(
    withState(initialState),
    withDevtools('eligible_items'),
    withMethods((store, eligibleItemService = inject(EligibleItemsService)) => ({
        fetchItems: rxMethod<{organizationId: string, couponId: string, skip?: number, take?: number, filter?: {name: string}}>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({organizationId, couponId, skip, take, filter}) => {

                    const page = Math.floor((skip ?? 0) / (take ?? 10));

                    if(store.loadedPages().has(page) && !filter) {
                        patchState(store, { isLoading: false });
                        return of(store.items());
                    }

                    return eligibleItemService.fetchItemsForCoupon(organizationId, couponId, filter, skip, take).pipe(
                        tapResponse({
                            next: (response) => {
                                if(response.code == 200) {
                                    const itemsList = plainToInstance(PaginatedList<ItemDto>, response.data);
                                    const items = itemsList.getItems()?.map((item) => plainToInstance(ItemDto, item));

                                    const updatedPages = store.loadedPages().add(page);

                                    const currentItems = store.items() ?? [];
                                    let updatedItems = [];

                                    if(filter) {
                                        updatedItems = items!;
                                    } else {
                                        updatedItems = [...currentItems, ...items!];
                                    }



                                    patchState(store, {isLoading: false, items: updatedItems, count: itemsList.getCount(), loadedPages: updatedPages})
                                }
                            },
                            error: (error:HttpErrorResponse) => {
                                if(error.status === 404) {
                                    patchState(store, { items: [], isLoading: false, count: 0, loadedPages: new Set<number>() });
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