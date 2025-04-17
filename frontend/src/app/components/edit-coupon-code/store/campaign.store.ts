import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import { CampaignDto } from '../../../../dtos/campaign.dto';
import { CampaignService } from '../../../services/campaign.service';
import { HttpErrorResponse } from '@angular/common/http';

type CampaignState = {
  data: CampaignDto | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: CampaignState = {
  data: null,
  isLoading: null,
  error: null,
};

export const CampaignStore = signalStore(
  withState(initialState),
  withDevtools('campaign'),
  withMethods((store, campaignService = inject(CampaignService)) => ({
    fetchCampaign: rxMethod<{ couponId: string, campaignId: string }>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
          })
        ),
        switchMap(({ couponId, campaignId }) => {
          return campaignService.fetchCampaign(couponId, campaignId).pipe(
            tapResponse({
              next: (response) => {
                if (response.code == 200) {
                  patchState(store, {
                    data: plainToInstance(CampaignDto, response.data!),
                    isLoading: false,
                    error: null,
                  });
                }
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, {
                  data: store.data(),
                  isLoading: false,
                  error: error.message,
                });
              },
            })
          );
        })
      )
    ),
  }))
);
