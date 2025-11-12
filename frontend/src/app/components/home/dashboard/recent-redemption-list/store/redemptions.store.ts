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
      isFilterApplied?: boolean;
    }>(
      pipe(
        tap(({ isFilterApplied }) => {
          patchState(store, { isLoading: !!isFilterApplied });
        }),
        concatMap(
          ({
            organizationId,
            filter,
            skip = 0,
            take = 10,
            sortOptions,
            isSortOperation = false,
          }) => {
            const page = Math.floor(skip / take);

            // avoid unnecessary re-fetches
            if (store.loadedPages().has(page) && !filter && !isSortOperation) {
              patchState(store, { isLoading: false });
              return of(store.redemptions());
            }

            return dashboardService
              .fetchRedemptionsForOrganization(
                organizationId,
                filter,
                sortOptions,
                skip,
                take
              )
              .pipe(
                tapResponse({
                  next: (response) => {
                    if (response.code === 200) {
                      const workbook = plainToInstance(
                        RedemptionWorkbook,
                        response.data,
                      );

                      const table = workbook
                        .getRedemptionSheet()
                        .getRedemptionTable();

                      const redemptions =
                        table.getRows()?.map((_, i) => table.getRow(i)) ?? [];

                      const metadata = table.getMetadata();
                      const totalCount = Number(metadata.get('count')) ?? 0;

                      const updatedPages = new Set(store.loadedPages());
                      updatedPages.add(page);

                      let updatedRedemptions: RedemptionRow[];

                      if (filter || isSortOperation) {
                        updatedRedemptions = redemptions;
                      } else {
                        updatedRedemptions = [
                          ...(store.redemptions() ?? []),
                          ...redemptions,
                        ];
                      }

                      patchState(store, {
                        redemptions: updatedRedemptions,
                        isLoading: false,
                        count: totalCount,
                        loadedPages: updatedPages,
                        error: null,
                      });
                    }
                  },
                  error: (error: HttpErrorResponse) => {
                    const isNotFound = error.status === 404;
                    patchState(store, {
                      error: error.message,
                      isLoading: false,
                      redemptions: isNotFound ? [] : store.redemptions(),
                      count: isNotFound ? 0 : store.count(),
                      loadedPages: isNotFound ? new Set() : store.loadedPages(),
                    });
                  },
                })
              );
          }
        )
      )
    ),

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set(),
      });
    },
  }))
);
