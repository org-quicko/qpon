import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { OrganizationUserDto } from '../../dtos/organization-user.dto';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToClass } from 'class-transformer';
import { Router } from '@angular/router';
import { withDevtools } from "@angular-architects/ngrx-toolkit";

type OrganizationUser = {
  organizations: OrganizationUserDto[];
  isLoading: boolean;
  error: string | null;
};

const initialState: OrganizationUser = {
  organizations: [],
  isLoading: true,
  error: null,
};

export const OrganizationUserStore = signalStore(
  { providedIn: 'root' },
  withDevtools('organization_user'),
  withState(initialState),
  withMethods(
    (store, userService = inject(UserService), router = inject(Router)) => ({
      fetchOrganizationsForUser: rxMethod<{ userId: string }>(
        pipe(
          concatMap(({ userId }) => {
            return userService.fetchOrganizationsForUser(userId).pipe(
              tapResponse({
                next: (response) => {
                  const organizations = response.data;
                  patchState(store, {
                    organizations: organizations?.map((organization) =>
                      plainToClass(OrganizationUserDto, organization)
                    ),
                  });
                  patchState(store, { isLoading : false });
                },
                error: (error: any) => {
                  patchState(store, {isLoading: false, error: error.message})
                },
              }),
              catchError((error) => {
                patchState(store, {isLoading: false, error: error.message})
                return EMPTY;
              })
            );
          })
        )
      ),
    })
  )
);
