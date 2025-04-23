import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CampaignSummaryRow, CampaignSummaryWorkbook } from "../../../../../../../generated/sources/campaign_summary_workbook";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { EventEmitter, inject } from "@angular/core";
import { CampaignService } from "../../../../../../services/campaign.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { plainToInstance } from "class-transformer";
import { SnackbarService } from "../../../../../../services/snackbar.service";
import { HttpErrorResponse } from "@angular/common/http";

export const OnCampaignSuccess = new EventEmitter<boolean>();
export const OnCampaignError = new EventEmitter<string>();

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
    withMethods((store, campaignService = inject(CampaignService), snackbarService = inject(SnackbarService)) => ({
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
        ),

        deleteCampaign: rxMethod<{couponId: string, campaignId: string}>(
            pipe(
                tap(() => {
                    patchState(store, {
                        isLoading: true,
                    })
                }),
                switchMap(({ couponId, campaignId }) => {
                    return campaignService.deleteCampaign(couponId, campaignId).pipe(
                        tapResponse({
                            next: (response) => {
                                if (response.code == 200) {
                                    patchState(store, {campaign: null, isLoading: false});

                                    snackbarService.openSnackBar('Campaign successfully deleted', undefined);

                                    OnCampaignSuccess.emit(true);
                                }
                            },
                            error: (error: HttpErrorResponse) => {
                                patchState(store, {error: error.message, isLoading: false});

                                snackbarService.openSnackBar('Error deleting campaign', undefined);
                                
                                OnCampaignError.emit(error.message);
                            },
                        })
                    )
                })
            )
        )
    }))
)