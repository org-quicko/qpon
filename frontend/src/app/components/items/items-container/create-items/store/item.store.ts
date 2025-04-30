import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CreateItemDto, ItemDto, UpdateItemDto } from '../../../../../../dtos/item.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, from, map, pipe, switchMap, tap, toArray } from 'rxjs';
import { EventEmitter, inject } from '@angular/core';
import { ItemsService } from '../../../../../services/items.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { SnackbarService } from '../../../../../services/snackbar.service';

export const onItemSuccess = new EventEmitter<boolean>();
export const onItemError = new EventEmitter<string>();

type ItemState = {
  item: CreateItemDto | null;
  items: CreateItemDto[] | null;
  isLoading: boolean;
  error: string | null;
  onNext: boolean;
  onBack: boolean;
  currentStep: number;
  toalSteps: number;
};

const initialState: ItemState = {
  item: null,
  items: null,
  isLoading: false,
  error: null,
  onNext: false,
  onBack: false,
  currentStep: 0,
  toalSteps: 2,
};

export const ItemStore = signalStore(
  withState(initialState),
  withDevtools('item'),
  withMethods(
    (
      store,
      itemService = inject(ItemsService),
      snackbarService = inject(SnackbarService)
    ) => ({
      setOnNext() {
        patchState(store, {
          onNext: !store.onNext(),
        });
      },

      setOnBack() {
        patchState(store, {
          onBack: !store.onBack(),
        });
      },

      setItem(item: CreateItemDto) {
        const items = store.items() ?? [];

        const existingIndex = items.findIndex(
          (it) => it.name?.toLowerCase() === item.name?.toLowerCase()
        );

        let updatedItems: CreateItemDto[];

        if (existingIndex !== -1) {
          updatedItems = [...items];
          updatedItems[existingIndex] = item;
        } else {
          updatedItems = [...items, item];
        }

        patchState(store, {
          item: item,
          items: updatedItems,
        });
      },

      resetItem() {
        patchState(store, {
          item: null,
        });
      },

      resetCurrentStep() {
        patchState(store, {
          currentStep: 0,
        });
      },

      nextStep() {
        patchState(store, {
          currentStep: Math.min(store.currentStep() + 1, store.toalSteps() - 1),
        });
      },

      previousStep() {
        patchState(store, {
          currentStep: Math.max(store.currentStep() - 1, 0),
        });
      },

      createItems: rxMethod<{ organizationId: string; items: CreateItemDto[] }>(
        pipe(
          tap(() => {
            patchState(store, { isLoading: true, error: null });
          }),

          switchMap(({ organizationId, items }) => {
            return from(items).pipe(
              concatMap((item) =>
                itemService.createItem(organizationId, instanceToPlain(item))
              ),
              toArray(),
              tapResponse({
                next: () => {
                  patchState(store, {
                    isLoading: false,
                    items: [],
                    item: null,
                  });

                  snackbarService.openSnackBar('Items created successfully', undefined);

                  onItemSuccess.emit(true);
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });

                  if(error.status == 409) {
                    snackbarService.openSnackBar('Item already exists', undefined);
                  } else {
                    snackbarService.openSnackBar('Error creating items', undefined);
                  }

                  onItemError.emit(error.message);
                },
              })
            );
          })
        )
      ),

      fetchItem: rxMethod<{organizationId: string, itemId: string}>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true
            })
          }),
          switchMap(({ organizationId, itemId }) => {
            return itemService.fetchItem(organizationId, itemId).pipe(
              tapResponse({
                next: (response) => {
                  if(response.code == 200) {
                    patchState(store, {
                      item: plainToInstance(ItemDto, response.data),
                      isLoading: false,
                      error: null
                    })
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message
                  })

                  snackbarService.openSnackBar('Error fetching item', undefined);
                }
              })
            )
          })
        )
      ),

      updateItem: rxMethod<{organizationId: string, itemId: string, body: UpdateItemDto}>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true
            })
          }),
          switchMap(({ organizationId, itemId, body }) => {
            return itemService.updateItem(organizationId, itemId, body).pipe(
              tapResponse({
                next: (response) => {
                  if(response.code == 200) {
                    patchState(store, {
                      item: plainToInstance(ItemDto, response.data),
                      isLoading: false,
                      error: null
                    })

                    snackbarService.openSnackBar('Item updated successfully', undefined);
                    onItemSuccess.emit(true);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message
                  });

                  snackbarService.openSnackBar('Error updating item', undefined);
                  onItemError.emit(error.message);
                }
              })
            )
          })
        )
      ),

      editItem(item: CreateItemDto, index: number) {
        let items = store.items() ?? [];

        items.splice(index, 1);
        items.push(item);

        patchState(store, {
          items
        })
      }
    })
  )
);
