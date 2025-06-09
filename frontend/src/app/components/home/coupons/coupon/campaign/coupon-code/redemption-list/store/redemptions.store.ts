import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  RedemptionRow,
  RedemptionWorkbook,
} from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { RedemptionsService } from '../../../../../../../../services/redemptions.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, of, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';
import { sortOrderEnum } from '../../../../../../../../../enums';

type RedemptionsState = {
  redemptions: RedemptionRow[] | null;
  isLoading: boolean | null;
  error: string | null;
  count: number | null;
  loadedPages: Set<number>;
};

const initialState: RedemptionsState = {
  redemptions: null,
  count: null,
  isLoading: null,
  loadedPages: new Set(),
  error: null,
};

export const RedemptionsStore = signalStore(
  withState(initialState),
  withDevtools('redemptions'),
  withMethods((store, redemptionsService = inject(RedemptionsService)) => ({
    fetchRedemptions: rxMethod<{
      organizationId: string;
      couponId: string;
      campaignId: string;
      couponCodeId: string;
      filter?: { email: string };
      skip?: number;
      take?: number;
      sortOptions?: {sortBy: string, sortOrder: sortOrderEnum};
      isSortOperation?: boolean;
      isFilterApplied?: boolean;
    }>(
      pipe(
        tap(({isFilterApplied}) => {
          if (!isFilterApplied) {
            patchState(store, { isLoading: false });
          } else {
            patchState(store, { isLoading: true });
          }
        }),
        concatMap(
          ({
            organizationId,
            couponId,
            campaignId,
            couponCodeId,
            filter,
            skip,
            take,
            sortOptions,
            isSortOperation
          }) => {

            const page = Math.floor((skip ?? 0) / (take ?? 10));

            if(store.loadedPages().has(page) && !filter && !isSortOperation) {
              patchState(store, { isLoading: false });
              return of(store.redemptions());
            }

            return redemptionsService
              .fetchRedemptionsForCouponCode(
                organizationId,
                couponId,
                campaignId,
                couponCodeId,
                filter,
                sortOptions,
                skip,
                take
              )
              .pipe(
                tapResponse({
                  next: (response) => {
                    if (response.code == 200) {
                      const redemptionsTable = plainToInstance(
                        RedemptionWorkbook,
                        JSON.parse(JSON.stringify(response.data))
                      )
                        .getRedemptionSheet()
                        .getRedemptionTable();

                      const redemptions = redemptionsTable
                        .getRows()
                        ?.map((_, index) => redemptionsTable.getRow(index));

                      const metadata = redemptionsTable.getMetadata();

                      const updatedPages = store.loadedPages().add(page);

                      const currentRedemptions = store.redemptions() ?? [];
                      let updatedRedemptions = [];

                      if(filter || isSortOperation) {
                        updatedRedemptions = redemptions
                      } else {
                        updatedRedemptions = [...currentRedemptions, ...redemptions];
                      }

                      patchState(store, {
                        redemptions: updatedRedemptions,
                        isLoading: false,
                        count: Number(metadata.get('count')) ?? 0,
                        loadedPages: updatedPages
                      });
                    }
                  },
                  error: (error: HttpErrorResponse) => {
                    if (error.status == 404) {
                      patchState(store, {
                        error: error.message,
                        isLoading: false,
                        redemptions: [],
                        count: 0,
                        loadedPages: new Set()
                      });
                    } else {
                      patchState(store, {
                        error: error.message,
                        isLoading: false,
                      });
                    }
                  },
                })
              );
          }
        )
      )
    ),

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set()
      })
    }
  }))
);
