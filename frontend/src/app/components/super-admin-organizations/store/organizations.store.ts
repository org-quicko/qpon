import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { OrganizationMvDto } from '../../../../dtos/organizationsMv.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { OrganizationService } from '../../../services/organization.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { plainToInstance } from 'class-transformer';
import { PaginatedList } from '../../../../dtos/paginated-list.dto';

type OrganizationsState = {
  organizations: OrganizationMvDto[] | null;
  isLoading: boolean;
  count: number | null;
  error: string | null;
};

const initialState: OrganizationsState = {
  organizations: null,
  isLoading: false,
  count: null,
  error: null,
};

export const OrganizationsStore = signalStore(
  withState(initialState),
  withDevtools('organizations'),
  withMethods(
    (
      store,
      organizationService = inject(OrganizationService),
      snackbarService = inject(SnackbarService)
    ) => ({
      fetchOrganizations: rxMethod(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(() => {
            return organizationService.fetchOrganizations().pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    const organizationsList = plainToInstance(
                      PaginatedList<OrganizationMvDto>,
                      response.data
                    );

                    const organizations = organizationsList
                      .getItems()
                      ?.map((organization) =>
                        plainToInstance(OrganizationMvDto, organization)
                      );

                    patchState(store, {
                        organizations,
                        count: organizationsList.getCount(),
                        isLoading: false,
                        error: null
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                    patchState(store, {
                        error: error.message
                    });

                    snackbarService.openSnackBar('Error fetching organisations', undefined);
                },
              })
            );
          })
        )
      ),
    })
  )
);
