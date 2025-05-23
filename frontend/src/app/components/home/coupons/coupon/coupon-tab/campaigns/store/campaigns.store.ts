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
  CampaignSummaryWorkbook,
} from '../../../../../../../../generated/sources/campaign_summary_workbook';
import { campaignStatusEnum, sortOrderEnum, statusEnum } from '../../../../../../../../enums';
import { HttpErrorResponse } from '@angular/common/http';

type CampaignsState = {
  campaignSummaries: CampaignSummaryRow[] | null;
  filter?: { status: campaignStatusEnum };
  isLoading: boolean | null;
  skip?: number | null;
  take?: number | null;
  count: number | null;
  loadedPages: Set<number>;
  error: string | null;
};

const initialState: CampaignsState = {
  campaignSummaries: null,
  isLoading: null,
  skip: null,
  take: null,
  count: null,
  loadedPages: new Set(),
  error: null,
};

export const onChangeStatusSuccess = new EventEmitter<boolean>();

export const CampaignsStore = signalStore(
  withState(initialState),
  withDevtools('campaigns'),
  withMethods((store, campaignService = inject(CampaignService)) => ({
    fetchCampaingSummaries: rxMethod<{
      organizationId: string,
      couponId: string;
      skip?: number;
      take?: number;
      query?: { name: string };
      sortOptions?: { sortBy: string; sortOrder: sortOrderEnum };
      isSortOperation?: boolean;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ organizationId, couponId, skip, take, query, sortOptions, isSortOperation }) => {
          const page = Math.floor((skip ?? 0) / (take ?? 10));

          if (store.loadedPages().has(page) && !query && !isSortOperation) {
            patchState(store, { isLoading: false });
            return of(store.campaignSummaries());
          }

          return campaignService
            .fetchCampaignSummaries(
              organizationId,
              couponId,
              skip,
              take,
              query?.name!,
              sortOptions
            )
            .pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const campaignSummaryTable = plainToInstance(CampaignSummaryWorkbook, response.data)?.getCampaignSummarySheet()?.getCampaignSummaryTable()!;

                    const rows = campaignSummaryTable
                      .getRows()
                      ?.map((_, index) => campaignSummaryTable.getRow(index));

                    const metadata = campaignSummaryTable.getMetadata();

                    const updatedPages = store.loadedPages().add(page);

                    const currentCampaignSummaries =
                      store.campaignSummaries() ?? [];

                    let updatedCampaignSummaries: CampaignSummaryRow[] = [];

                    if (query || isSortOperation) {
                      updatedCampaignSummaries = rows!;
                    } else {
                      updatedCampaignSummaries = [
                        ...currentCampaignSummaries,
                        ...rows!,
                      ];
                    }

                    patchState(store, {
                      campaignSummaries: updatedCampaignSummaries,
                      count: metadata.getNumber('count'),
                      loadedPages: updatedPages,
                      isLoading: false,
                    });
                    onChangeStatusSuccess.emit(true);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      campaignSummaries: [],
                      loadedPages: new Set(),
                      isLoading: false,
                      count: 0,
                    });
                  }
                  patchState(store, { isLoading: false, error: error.message });
                },
              })
            );
        })
      )
    ),

    activateCampaign: rxMethod<{ organizationId: string, couponId: string; campaignId: string }>(
      pipe(
        switchMap(({ organizationId, couponId, campaignId }) => {
          return campaignService.activateCampaign(organizationId, couponId, campaignId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 201) {
                  const updatedRows = (
                    store.campaignSummaries() as CampaignSummaryRow[]
                  )?.map((campaignSummary) => {
                    if (campaignSummary[0] == campaignId) {
                      campaignSummary.setStatus(statusEnum.ACTIVE);
                    }

                    return campaignSummary;
                  });

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

    deactivateCampaign: rxMethod<{ organizationId: string, couponId: string; campaignId: string }>(
      pipe(
        concatMap(({ organizationId, couponId, campaignId }) => {
          return campaignService.deactivateCampaign(organizationId, couponId, campaignId).pipe(
            tap(),
            tapResponse({
              next: (response) => {
                if (response.code == 201) {
                  const updatedRows = store
                    .campaignSummaries()
                    ?.map((campaignSummary) => {
                      if (campaignSummary[0] == campaignId) {
                        campaignSummary.setStatus(statusEnum.INACTIVE);
                      }

                      return campaignSummary;
                    });

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

    resetLoadedPages() {
      patchState(store, {
        loadedPages: new Set<number>(),
      });
    },

    resetStore() {
      patchState(store, {
        campaignSummaries: null,
        count: null,
        isLoading: null, 
        loadedPages: new Set(),
        skip: null,
        take: null,
        error: null,
      })
    }
  }))
);
