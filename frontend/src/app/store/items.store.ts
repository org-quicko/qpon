import { EventEmitter, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ItemsService } from '../services/items.service';
import { catchError, concatMap, EMPTY, of, pipe, shareReplay, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ItemDto } from '../../dtos/item.dto';
import { plainToInstance } from 'class-transformer';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { PaginatedList } from '../../dtos/paginated-list.dto';
import { ItemFilter } from '../types/item-filter.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../services/snackbar.service';

export const OnItemSuccess = new EventEmitter<boolean>();
export const OnItemError = new EventEmitter<string>();

type ItemsState = {
  items: ItemDto[];
  skip?: number | null;
  take?: number | null;
  count: number | null;
  isLoading: boolean;
  filter: { query: string } | null;
  loadedPages: Set<number>;
  error: string | null;
};

const initialState: ItemsState = {
  items: [],
  skip: null,
  take: null,
  count: null,
  isLoading: false,
  filter: null,
  loadedPages: new Set<number>(),
  error: null,
};

export const ItemsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('items'),
  withState(initialState),
  withMethods((store, itemsService = inject(ItemsService), snackbarService = inject(SnackbarService)) => ({
    fetchItems: rxMethod<{
      organizationId: string;
      skip?: number;
      take?: number;
      filter?: ItemFilter;
      isFilterApplied?: boolean;
    }>(
      pipe(
        tap(({ isFilterApplied }) => {
          if (!isFilterApplied) {
            patchState(store, { isLoading: true });
          }
        }),
        concatMap(({ organizationId, skip, take, filter }) => {
          const page = Math.floor((skip ?? 0) / (take ?? 10));

          if (store.loadedPages().has(page) && !filter) {
            patchState(store, { isLoading: false });
            return of(store.items());
          }

          return itemsService
            .fetchItems(organizationId, skip, take, filter)
            .pipe(
              tapResponse({
                next: (response) => {
                  const itemList = plainToInstance(
                    PaginatedList<ItemDto>,
                    response.data
                  );
                  const items = itemList
                    .getItems()
                    ?.map((item) => plainToInstance(ItemDto, item));

                  const updatedPages = store.loadedPages().add(page);
                  const currentItems = store.items() ?? [];
                  let updatedItems: ItemDto[] = [];

                  if (filter) {
                    updatedItems = items!;
                  } else {
                    updatedItems = [...currentItems, ...items!];
                  }

                  patchState(store, {
                    items: updatedItems,
                    skip: itemList?.getSkip(),
                    count: itemList?.getCount(),
                    take: itemList?.getTake(),
                    loadedPages: updatedPages,
                    isLoading: false,
                  });
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status === 404) {
                    patchState(store, {
                      items: [],
                      isLoading: false,
                      loadedPages: new Set(),
                      count: 0,
                    });
                  } else {
                    patchState(store, {
                      isLoading: false,
                      error: error.message,
                    });
                  }
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
                    items: store
                      .items()
                      .filter((item) => item.itemId !== itemId),
                  });

                  snackbarService.openSnackBar('Item deleted successfully', undefined);

                  OnItemSuccess.emit(true);
                }
              },
              error: (error: any) => {
                patchState(store, { isLoading: false, error: error.message });

                snackbarService.openSnackBar('Error deleting item', undefined);
              },
            })
          );
        })
      )
    ),

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set(),
      });
    },

    resetItems() {
      patchState(store, {
        items: [],
        count: null
      })
    }
  }))
);
