import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  RedemptionRow,
  RedemptionWorkbook,
} from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { DashboardService } from '../../../../../services/dashboard.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, of, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';
import { sortOrderEnum } from '../../../../../../enums';

type RedemptionsState = {
  redemptions: RedemptionRow[] | null;
  isLoading: boolean;
  error: string | null;
  count: number;
  loadedPages: Set<number>;
};

const initialState: RedemptionsState = {
  redemptions: null,
  count: 0,
  isLoading: false,
  loadedPages: new Set(),
  error: null,
};

export const RedemptionsStore = signalStore(
  withState(initialState),
  withDevtools('redemptions'),
  withMethods((store, dashboardService = inject(DashboardService)) => ({

    fetchRedemptions: rxMethod<{
      organizationId: string;
      filter?: { email: string };
      skip?: number;
      take?: number;
      sortOptions?: { sortBy: string; sortOrder: sortOrderEnum };
      isSortOperation?: boolean;
      from?: string;
      to?: string;
    }>(
      pipe(
        tap(() => {
          // ALWAYS start loading before request
          patchState(store, { isLoading: true });
        }),
        concatMap(({ organizationId, filter, skip = 0, take = 5, sortOptions, isSortOperation = false, from, to }) => {
          const page = Math.floor(skip / take);

          const shouldSkip =
            store.loadedPages().has(page) &&
            !filter &&
            !isSortOperation &&
            skip !== 0;

          if (shouldSkip) {
            patchState(store, { isLoading: false });
            return of(store.redemptions());
          }

          return dashboardService
            .fetchRedemptionsForOrganization(
              organizationId,
              filter,
              sortOptions,
              skip,
              take,
              from,
              to
            )
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code === 200) {
                    const workbook = plainToInstance(
                      RedemptionWorkbook,
                      response.data
                    );

                    const table = workbook.getRedemptionSheet().getRedemptionTable();

                    const rows =
                      table.getRows()?.map((_, i) => table.getRow(i)) ?? [];

                    const total = Number(table.getMetadata().get('count')) ?? 0;

                    const updatedPages = new Set(store.loadedPages());
                    updatedPages.add(page);

                    const shouldReplace =
                      page === 0 || filter || isSortOperation || skip === 0;

                    patchState(store, {
                      redemptions: shouldReplace
                        ? rows
                        : [...(store.redemptions() ?? []), ...rows],
                      count: total,
                      loadedPages: updatedPages,
                      isLoading: false, // END LOADING
                      error: null,
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  const isNotFound = error.status === 404;

                  patchState(store, {
                    redemptions: isNotFound ? [] : store.redemptions(),
                    count: isNotFound ? 0 : store.count(),
                    loadedPages: isNotFound ? new Set() : store.loadedPages(),
                    isLoading: false, // END LOADING
                    error: error.message,
                  });
                },
              })
            );
        })
      )
    ),

    resetLoadedPages() {
      patchState(store, { loadedPages: new Set() });
    },

    resetRedemptionsState() {
      patchState(store, {
        redemptions: [],
        count: 0,
        isLoading: false,
        loadedPages: new Set(),
        error: null,
      });
    },
  }))
);

