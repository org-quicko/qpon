import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LoginCredentialDto } from '../../../../dtos/auth.dto';
import { UserService } from '../../../services/user.service';
import { EventEmitter, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../services/snackbar.service';
import { CreateUserDto } from '../../../../dtos/user.dto';
import { instanceToPlain } from 'class-transformer';

type SetupState = {
  superAdmin: CreateUserDto | null;
  error: string | null;
};

const initialState: SetupState = {
  superAdmin: null,
  error: null,
};

export const OnSuccess: EventEmitter<boolean> = new EventEmitter();
export const OnError: EventEmitter<string> = new EventEmitter()

export const SetupStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      userService = inject(UserService),
      snackbarService = inject(SnackbarService)
    ) => ({
      createSuperAdmin: rxMethod<{ body: CreateUserDto }>(
        pipe(
          concatMap(({ body }) => {
            return userService.createSuperAdmin(instanceToPlain(body)).pipe(
              tapResponse({
                next: (response) => {
                  if (response.data) {
                    OnSuccess.emit(true);
                  } else {
                    patchState(store, { error: response.message });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if(error.status === 409) {
                    snackbarService.openSnackBar('Super admin already exists', undefined)
                  } else {
                    snackbarService.openSnackBar('Error creating super admin', undefined);
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
