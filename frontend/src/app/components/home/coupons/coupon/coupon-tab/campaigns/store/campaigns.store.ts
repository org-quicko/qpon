import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { EventEmitter, Inject, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { CampaignService } from '../../../../../../../services/campaign.service';
import {
  CampaignSummaryRow,
  CampaignSummarySheet,
  CampaignSummaryTable,
  CampaignSummaryWorkbook,
} from '../../../../../../../../generated/sources/campaign_summary_workbook';
import { statusEnum } from '../../../../../../../../enums';

type CampaignsState = {
  campaignSummaries: CampaignSummaryRow[] | null;
  filter?: {status: statusEnum},
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CampaignsState = {
  campaignSummaries: null,
  isLoading: null,
  error: null,
};

export const onChangeStatusSuccess = new EventEmitter<boolean>();

export const CampaignsStore = signalStore(
  withState(initialState),
  withDevtools('campaigns'),
  withMethods((store, campaignService = inject(CampaignService)) => ({
    fetchCampaingSummaries: rxMethod<{ couponId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ couponId }) => {
          return campaignService.fetchCampaignSummaries(couponId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 200) {
                  const campaignSummaryTable = plainToInstance(CampaignSummaryWorkbook, response.data).getCampaignSummarySheet().getCampaignSummaryTable();
                  
                  const rows = campaignSummaryTable.getRows()?.map((_, index) => campaignSummaryTable.getRow(index))
                  patchState(store, {
                    campaignSummaries: rows,
                    isLoading: false,
                  });
                  onChangeStatusSuccess.emit(true);
                }
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

    activateCampaign: rxMethod<{ couponId: string; campaignId: string }>(
      pipe(
        switchMap(({ couponId, campaignId }) => {
          return campaignService.activateCampaign(couponId, campaignId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 201) {
                  const updatedRows = (store.campaignSummaries() as CampaignSummaryRow[])?.map((campaignSummary) => {

                    if(campaignSummary[0] == campaignId) {
                      campaignSummary.setStatus(statusEnum.ACTIVE)
                    }

                    return campaignSummary;
                  })

                  patchState(store, {
                    campaignSummaries: updatedRows,
                    isLoading: false,
                  });
                  
                  onChangeStatusSuccess.emit(true);
                }
              },
              error: (error: any) => {
                patchState(store, { error: error.message });

                onChangeStatusSuccess.emit(false);
              },
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return of(null);
            })
          );
        })
      )
    ),

    deactivateCampaign: rxMethod<{ couponId: string; campaignId: string }>(
      pipe(
        concatMap(({ couponId, campaignId }) => {
          return campaignService.deactivateCampaign(couponId, campaignId).pipe(
            tap(),
            tapResponse({
              next: (response) => {
                if (response.code == 201) {
                  const updatedRows = store.campaignSummaries()?.map((campaignSummary) => {
                    if(campaignSummary[0] == campaignId) {
                      campaignSummary.setStatus(statusEnum.INACTIVE)
                    }

                    return campaignSummary;
                  })

                  patchState(store, {
                    campaignSummaries: updatedRows,
                  });

                  onChangeStatusSuccess.emit(true);
                }
              },
              error: (error: any) => {
                patchState(store, { error: error.message });
                onChangeStatusSuccess.emit(false);
              },
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return EMPTY;
            })
          );
        })
      )
    ),
  }))
);
