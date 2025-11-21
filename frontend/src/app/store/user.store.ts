import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { UserService } from '../services/user.service';
import { catchError, concatMap, EMPTY, pipe, shareReplay, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UpdateUserDto, UserDto } from '../../dtos/user.dto';
import { plainToInstance } from 'class-transformer';
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { SnackbarService } from '../services/snackbar.service';

type UserState = {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withDevtools('user'),
  withState(initialState),
  withMethods((store, userService = inject(UserService), snack = inject(SnackbarService)) => ({
    fetchUser: rxMethod<{ userId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        concatMap(({ userId }) => {
          return userService.fetchUser(userId).pipe(
            tapResponse({
              next: (response) => {
                const user = response.data;
                patchState(store, {
                  user: plainToInstance(UserDto, user),
                  isLoading: false,
                });
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
    updateUser: rxMethod<{
      organizationId: string;
      userId: string;
      body: UpdateUserDto;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(({ organizationId, userId, body }) =>
          userService.updateUser(organizationId, userId, body).pipe(
            tapResponse({
              next: (response) => {
                const updatedUser = plainToInstance(UserDto, response.data);
                patchState(store, {
                  user: updatedUser,
                  isLoading: false,
                });

                snack.openSnackBar('Profile updated successfully', undefined);
              },
              error: (error: any) => {
                patchState(store, {
                  isLoading: false,
                  error: error?.message || 'Failed to update user',
                });

                snack.openSnackBar(error.message || 'Failed to load user', 'Close');
              },
            }),
            catchError((error) => {
              patchState(store, {
                isLoading: false,
                error: error?.message || 'Failed to update user',
              });
              snack.openSnackBar('Failed to update user', 'Close');
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
