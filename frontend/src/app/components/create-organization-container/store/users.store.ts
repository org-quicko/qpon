import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { UserDto } from '../../../../dtos/user.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../services/snackbar.service';
import { plainToInstance } from 'class-transformer';
import { PaginatedList } from '../../../../dtos/paginated-list.dto';

type UsersState = {
  users: UserDto[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initalState: UsersState = {
  users: null,
  isLoading: null,
  error: null,
};

export const UsersStore = signalStore(
  withState(initalState),
  withDevtools('users'),
  withMethods(
    (
      store,
      userService = inject(UserService),
      snackbarService = inject(SnackbarService)
    ) => ({
      fetchUsers: rxMethod<{ email?: string; skip?: number; take?: number }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(({ email, skip, take }) => {
            return userService.fetchUsers(email, skip, take).pipe(
              tapResponse({
                next: (response) => {
                  const usersList = plainToInstance(
                    PaginatedList<UserDto>,
                    response.data
                  ).getItems() ?? [];

                  const users = usersList.map((user) =>
                    plainToInstance(UserDto, user)
                  );

                  patchState(store, {
                    isLoading: false,
                    users,
                  });
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });
                },
              })
            );
          })
        )
      ),
    })
  )
);
