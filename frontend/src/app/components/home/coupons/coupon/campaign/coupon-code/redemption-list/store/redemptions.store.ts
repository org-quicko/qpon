import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  RedemptionRow,
  RedemptionWorkbook,
} from '../../../../../../../../../generated/sources/redemption_workbook';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { RedemptionsService } from '../../../../../../../../services/redemptions.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { HttpErrorResponse } from '@angular/common/http';

type RedemptionsState = {
  redemptions: RedemptionRow[] | null;
  isLoading: boolean | null;
  error: string | null;
  skip: number | null;
  take: number | null;
  count: number | null;
};

const initialState: RedemptionsState = {
  redemptions: null,
  count: null,
  skip: null,
  take: null,
  isLoading: null,
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
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(
          ({
            organizationId,
            couponId,
            campaignId,
            couponCodeId,
            filter,
            skip,
            take,
          }) => {
            return redemptionsService
              .fetchRedemptionsForCouponCode(
                organizationId,
                couponId,
                campaignId,
                couponCodeId,
                filter,
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

                      patchState(store, {
                        redemptions,
                        isLoading: false,
                        count: metadata.get('count'),
                        skip: metadata.get('skip'),
                        take: metadata.get('take'),
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
                        skip: 0,
                        take: 10,
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
  }))
);
