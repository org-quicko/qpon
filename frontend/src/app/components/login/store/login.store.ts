import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LoginCredentialDto } from '../../../../dtos/auth.dto';
import { UserService } from '../../../services/user.service';
import { EventEmitter, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../services/snackbar.service';

type LoginState = {
  loginCredentials: LoginCredentialDto | null;
  error: string | null;
};

const initialState: LoginState = {
  loginCredentials: null,
  error: null,
};

export const onSignInSuccess: EventEmitter<boolean> = new EventEmitter();
export const onSignInError: EventEmitter<string> = new EventEmitter()

export const LoginStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      userService = inject(UserService),
      authService = inject(AuthService),
      snackbarService = inject(SnackbarService)
    ) => ({
      login: rxMethod<{ email: string; password: string }>(
        pipe(
          concatMap(({ email, password }) => {
            return userService.login(email, password).pipe(
              tapResponse({
                next: (response) => {
                  if (response.data) {
                    authService.setToken(response.data.access_token);
                    onSignInSuccess.emit(true);
                  } else {
                    patchState(store, { error: response.message });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if(error.status === 401 || error.status == 400) {
                    snackbarService.openSnackBar('Invalid credentials', 'error')

                  }
                  patchState(store, { error: error.message });
                },
              })
            );
          })
        )
      ),
    })
  )
);
