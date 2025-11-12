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
  CouponCodeSummaryWorkbook,
} from '@org-quicko/qpon-sheet-core/coupon_code_summary_workbook/beans';

type CouponCodeSummaryState = {
  data: CouponCodeSummaryWorkbook | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: CouponCodeSummaryState = {
  data: null,
  isLoading: false,
  error: null,
};

export const CouponCodeSummaryStore = signalStore(
  withState(initialState),
  withDevtools('coupon_code_summary_store'),
  withMethods(
    (store, dashboardService = inject(DashboardService), snackbar = inject(SnackbarService)) => ({
      fetchCouponCodeSummary: rxMethod<{ organizationId: string; startDate?: string | Date; endDate?: string | Date }>(
        pipe(
          tap(() =>
            patchState(store, { isLoading: true, error: null })
          ),
          switchMap(({ organizationId, startDate, endDate }) =>
            dashboardService.fetchCouponCodesSummary(organizationId, startDate, endDate).pipe(
              tapResponse({
                next: (response) => {
                  if (response?.code === 200) {
                    patchState(store, {
                      data: plainToInstance(CouponCodeSummaryWorkbook, response.data),
                      isLoading: false,
                      error: null,
                    });
                  } else {
                    patchState(store, { isLoading: false, error: 'Invalid response from server.' });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  snackbar.openSnackBar('Unable to fetch Coupon Code Summary', undefined);
                  patchState(store, { isLoading: false, error: error.message });
                },
              })
            )
          )
        )
      ),

      resetCouponCodeSummary: () =>
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

      const sheet = workbook.getCouponCodeSummarySheet?.();
      const table = sheet?.getCouponCodeSummaryTable?.();
      const rows = (table?.getRows?.() ?? []) as unknown[];
      const headers = (table?.getHeader?.() ?? []) as unknown[];

      if (!rows.length) return [];

      const normalizedRows = rows.map((r: any) => plainToInstance(Object, r));

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
