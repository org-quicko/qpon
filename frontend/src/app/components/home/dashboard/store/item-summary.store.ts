import { computed, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { plainToInstance } from 'class-transformer';
import { SnackbarService } from '../../../../services/snackbar.service';
import { DashboardService } from '../../../../services/dashboard.service';
import {
  ItemsSummaryWorkbook,
  ItemsSummaryRow,
} from '@org-quicko/qpon-sheet-core/items_summary_workbook/beans';

type ItemSummaryState = {
  data: ItemsSummaryWorkbook | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ItemSummaryState = {
  data: null,
  isLoading: false,
  error: null,
};

export const ItemSummaryStore = signalStore(
  withState(initialState),
  withDevtools('item_summary_store'),
  withMethods(
    (store, dashboardService = inject(DashboardService), snackbar = inject(SnackbarService)) => ({
      fetchItemSummary: rxMethod<{ organizationId: string; startDate?: string | Date; endDate?: string | Date }>(
        pipe(
          tap(() =>
            patchState(store, { isLoading: true, error: null })
          ),
          switchMap(({ organizationId, startDate, endDate }) =>
            dashboardService.fetchItemsSummary(organizationId, startDate, endDate).pipe(
              tapResponse({
                next: (response) => {
                  if (response?.code === 200) {
                    patchState(store, {
                      data: plainToInstance(ItemsSummaryWorkbook, response.data),
                      isLoading: false,
                      error: null,
                    });
                  } else {
                    patchState(store, { isLoading: false, error: 'Invalid response from server.' });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  snackbar.openSnackBar('Unable to fetch Item Summary', undefined);
                  patchState(store, { isLoading: false, error: error.message });
                },
              })
            )
          )
        )
      ),

      resetItemSummary: () =>
        patchState(store, { data: null, isLoading: false, error: null }),
    })
  ),
  withComputed((store) => ({
    hasData: computed(() => !!store.data()),
    isEmpty: computed(() => !store.isLoading() && !store.data()),

    /** 🧠 Normalized chart data (label/value pairs) */
    popularityData: computed(() => {
      const workbook = store.data();
      if (!workbook) return [];

      const sheet = workbook.getItemsSummarySheet?.();
      const table = sheet?.getItemsSummaryTable?.();
      const rows = (table?.getRows?.() ?? []) as unknown[];
      const headers = (table?.getHeader?.() ?? []) as unknown[];

      if (!rows.length) return [];

      // Normalize
      const normalizedRows = rows.map((r: any) =>
        r instanceof ItemsSummaryRow ? r : plainToInstance(ItemsSummaryRow, r)
      );

      if (Array.isArray(rows[0])) {
        const headerStrings = headers.filter((h): h is string => typeof h === 'string');
        const nameIndex = headerStrings.findIndex((h) => h.toLowerCase().includes('name'));
        const redemptionIndex = headerStrings.findIndex((h) => h.toLowerCase().includes('redemption'));

        return (rows as any[][]).map((r) => ({
          label: r[nameIndex] ?? 'Unknown',
          value: Number(r[redemptionIndex]) || 0,
        }));
      }

      return normalizedRows.map((r: any) => ({
        label: r.getName?.() ?? r.name ?? 'Unknown',
        value:
          r.getTotalRedemptions?.() ?? r.totalRedemptions ?? r.RedemptionCount ?? 0,
      }));
    }),
  }))
);
