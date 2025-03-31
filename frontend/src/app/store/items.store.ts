import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ItemsService } from '../services/items.service';
import { catchError, concatMap, EMPTY, pipe, shareReplay, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ItemDto } from '../../dtos/item.dto';
import { plainToClass } from 'class-transformer';
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { ItemFilter } from '../interfaces/item-filter.interface';

type ItemsState = {
  items: ItemDto[];
  skip?: number | null,
  take?: number | null,
  count?: number | null,
  isLoading: boolean;
  filter: { query: string } | null;
  error: string | null;
};

const initialState: ItemsState = {
  items: [],
  skip: null,
  take: null,
  count: null,
  isLoading: false,
  filter: null,
  error: null,
};

export const ItemsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('items'),
  withState(initialState),
  withMethods((store, itemsService = inject(ItemsService)) => ({
    fetchItems: rxMethod<{ organizationId: string, skip?: number, take?: number, filter?: ItemFilter }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, skip, take, filter }) => {
          return itemsService.fetchItems(organizationId, skip, take, filter).pipe(
            tapResponse({
              next: (response) => {
                const itemList = plainToClass(PaginatedList<ItemDto>, response.data);
                patchState(store, {
                  items: itemList?.getItems()?.map((item) => plainToClass(ItemDto, item)),
                  skip: itemList?.getSkip(),
                  count: itemList?.getCount(),
                  take: itemList?.getTake(),
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

    deleteItem: rxMethod<{ organizationId: string; itemId: string }>(
      pipe(
        concatMap(({ organizationId, itemId }) => {
          return itemsService.deleteItem(organizationId, itemId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code === 200) {
                  patchState(store, {
                    items: store.items().filter((item) => item.itemId !== itemId),
                  });
                }
              },
              error: (error: any) => {
                patchState(store, { isLoading: false, error: error.message });
              },
            })
          );
        })
      )
    ),
  }))
);
