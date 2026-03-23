import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { ApiKeysService } from '../../../../../services/api-keys.service';
import { ApiKeyDto } from '../../../../../../dtos/api-key.dto';
import { SnackbarService } from '../../../../../services/snackbar.service';

type ApiKeysState = {
  apiKey: ApiKeyDto | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ApiKeysState = {
  apiKey: null,
  isLoading: false,
  error: null,
};

export const ApiKeysStore = signalStore(
  { providedIn: 'root' },
  withDevtools('api-keys'),
  withState(initialState),

  withMethods((store, apiKeysService = inject(ApiKeysService), snack = inject(SnackbarService)) => ({
    /** ---------------------------------------------------------
     * FETCH API KEY
     * --------------------------------------------------------- */
    fetchApiKey: rxMethod<{ organizationId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),

        concatMap(({ organizationId }) =>
          apiKeysService.fetchApiKey(organizationId).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  apiKey: response.data ?? null,
                  isLoading: false,
                });
              },
              error: (error: any) => {
                patchState(store, {
                  isLoading: false,
                  error: error?.message || 'Failed to fetch API key',
                });

                snack.openSnackBar(error?.message || 'Failed to fetch API key', undefined);
              },
            }),

            catchError((error) => {
              patchState(store, {
                isLoading: false,
                error: error?.message || 'Failed to fetch API key',
              });
              return EMPTY;
            })
          )
        )
      )
    ),

    /** ---------------------------------------------------------
     * GENERATE API KEY
     * --------------------------------------------------------- */
    generateApiKey: rxMethod<{ organizationId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),

        concatMap(({ organizationId }) =>
          apiKeysService.generateApiKey(organizationId).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  apiKey: response.data ?? null,
                  isLoading: false,
                });

                snack.openSnackBar('API key generated successfully', undefined);
              },
              error: (error: any) => {
                patchState(store, {
                  isLoading: false,
                  error: error?.message || 'Failed to generate API key',
                });

                snack.openSnackBar(error?.message || 'Failed to generate API key', undefined);
              },
            }),

            catchError((error) => {
              patchState(store, {
                isLoading: false,
                error: error?.message || 'Failed to generate API key',
              });
              return EMPTY;
            })
          )
        )
      )
    ),

    /** ---------------------------------------------------------
     * RESET STATE
     * --------------------------------------------------------- */
    resetState() {
      patchState(store, initialState);
    },
    clearSecret() {
			const current = store.apiKey();
			if (current) {
				patchState(store, {
					apiKey: { ...current, secret: undefined },
				});
			}
		}
  }))
);
