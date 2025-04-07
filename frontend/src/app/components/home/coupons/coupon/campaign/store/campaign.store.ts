import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CampaignSummaryRow, CampaignSummaryWorkbook } from "../../../../../../../generated/sources/campaign_summary_workbook";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { CampaignService } from "../../../../../../services/campaign.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";

type CampaignState = {
    campaign: CampaignSummaryRow | null;
    isLoading: boolean | null;
    error: string | null;
}

const initialState: CampaignState = {
    campaign: null,
    isLoading: null,
    error: null,
}

export const CampaignStore = signalStore(
    withState(initialState),
    withDevtools('campaign'),
    withMethods((store, campaignService = inject(CampaignService)) => ({
        fetchCampaignSummary: rxMethod<{couponId: string, campaignId: string}>(
            pipe(
                tap(() => patchState(store, {isLoading: true})),
                switchMap(({couponId, campaignId}) => {
                    return campaignService.fetchCampaignSummary(couponId, campaignId).pipe(
                        tapResponse({
                            next: (response) => {
                                if(response.code == 200) {
                                    const campaignSummaryTable = plainToInstance(CampaignSummaryWorkbook, response.data).getCampaignSummarySheet().getCampaignSummaryTable()

                                    patchState(store, {
                                        campaign: campaignSummaryTable.getRow(0),
                                        isLoading: false
                                    })
                                }
                            },
                            error: (error: any) => {
                                patchState(store, {isLoading: false, error: error.message})
                            }
                        })
                    )
                })
            )
        )
    }))
)