import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { OrganizationMvDto } from '../../../../dtos/organizationsMv.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { OrganizationService } from '../../../services/organization.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { plainToInstance } from 'class-transformer';
import { PaginatedList } from '../../../../dtos/paginated-list.dto';
import { sortOrderEnum } from '../../../../enums';

type OrganizationsState = {
  organizations: OrganizationMvDto[] | null;
  isLoading: boolean;
  count: number | null;
  loadedPages: Set<number>;
  filter?: {name: string};
  error: string | null;
};

const initialState: OrganizationsState = {
  organizations: null,
  isLoading: false,
  count: null,
  loadedPages: new Set(),
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
      fetchOrganizations: rxMethod<{
        filter?: {name: string};
        skip?: number;
        take?: number;
        sortOptions?: {
          sortBy: string,
          sortOrder: sortOrderEnum 
        },
        isSortOperation?: boolean
      }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(({ filter, skip, take, sortOptions, isSortOperation }) => {
            const page = Math.floor((skip ?? 0) / (take ?? 10));

            if(store.loadedPages().has(page) && !filter && !isSortOperation) {
              patchState(store, { isLoading: false });
              return of(store.organizations());
            }

            return organizationService.fetchOrganizations(filter?.name, sortOptions, skip, take).pipe(
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

                      const currentOrganizations = store.organizations() ?? [];
                      let updatedOrganizations = [];
                      const updatedPages = store.loadedPages().add(page);

                      if(filter) {
                        updatedOrganizations = [...organizations!];
                      } else {
                        updatedOrganizations = [...currentOrganizations, ...organizations!];
                      }

                    patchState(store, {
                      organizations: updatedOrganizations,
                      count: organizationsList.getCount(),
                      isLoading: false,
                      loadedPages: updatedPages,
                      error: null,
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {

                  if(error.status == 404) {
                    patchState(store, {
                      isLoading: false,
                      organizations: [],
                      error: null,
                      count: null
                    });
                  } else {
                    patchState(store, {
                      error: error.message,
                    });
  
                    snackbarService.openSnackBar(
                      'Error fetching organisations',
                      undefined
                    );
                  }
                  
                },
              })
            );
          })
        )
      ),

      resetLoadedPages() {
        patchState(store, {
          loadedPages: new Set(),
        })
      },

      resetOrganizations() {
        patchState(store, {
          organizations: null
        })
      }
    })
  )
);
