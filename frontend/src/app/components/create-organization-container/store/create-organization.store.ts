import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  CreateOrganizationDto,
  OrganizationDto,
} from '../../../../dtos/organization.dto';
import { CreateUserDto } from '../../../../dtos/user.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, from, pipe, switchMap, tap, toArray } from 'rxjs';
import { EventEmitter, inject } from '@angular/core';
import { OrganizationService } from '../../../services/organization.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserService } from '../../../services/user.service';

export const OnCreateOrganizationSuccess = new EventEmitter<boolean>();
export const OnCreateOrganizationError = new EventEmitter<string>();

export const OnMemberSuccess = new EventEmitter<boolean>();
export const OnMemberError = new EventEmitter<string>();

type CreateOrganizationState = {
  organization: CreateOrganizationDto | null;
  createdOrganization: OrganizationDto | null;
  member: CreateUserDto | null;
  members: CreateUserDto[] | null;
  isLoading: boolean;
  onNext: boolean;
  currentStep: number;
  totalSteps: number;
  error: string | null;
};

const initialState: CreateOrganizationState = {
  organization: null,
  createdOrganization: null,
  isLoading: false,
  member: null,
  members: null,
  onNext: false,
  currentStep: 0,
  totalSteps: 3,
  error: null,
};

export const CreateOrganizationStore = signalStore(
  withState(initialState),
  withDevtools('create_organization'),
  withMethods(
    (
      store,
      organizationService = inject(OrganizationService),
      snackbarService = inject(SnackbarService),
      userService = inject(UserService)
    ) => ({
      setOnNext() {
        patchState(store, {
          onNext: !store.onNext(),
        });
      },

      nextStep() {
        patchState(store, {
          currentStep: Math.min(
            store.currentStep() + 1,
            store.totalSteps() - 1
          ),
        });
      },

      setMember(member: CreateUserDto) {
        const members = store.members() ?? [];

        patchState(store, {
          member: null,
          members: [...members, member],
        });
      },

      setCurrentStep(value: number) {
        patchState(store, {
          currentStep: value,
        });
      },

      removeMember(memberToRemove: CreateUserDto) {
        const members = store.members() ?? [];

        const updatedMembers = members.filter(
          (member) => member !== memberToRemove
        );

        patchState(store, {
          members: updatedMembers,
        });
      },

      createOrganization: rxMethod<{ body: CreateOrganizationDto }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
            });
          }),
          switchMap(({ body }) => {
            return organizationService.createOrganization(body).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 201) {
                    patchState(store, {
                      isLoading: false,
                      createdOrganization: plainToInstance(
                        OrganizationDto,
                        response.data
                      ),
                    });

                    snackbarService.openSnackBar(
                      'Organisation created successfully',
                      undefined
                    );

                    OnCreateOrganizationSuccess.emit(true);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });

                  snackbarService.openSnackBar(
                    'Error creating organisation',
                    undefined
                  );

                  OnCreateOrganizationError.emit(error.message);
                },
              })
            );
          })
        )
      ),

      inviteMembers: rxMethod<{ organizationId: string; members: CreateUserDto[] }>(
        pipe(
          tap(() => {
            patchState(store, { isLoading: true });
          }),

          switchMap(({ organizationId, members }) => {
            return from(members).pipe(
              concatMap((member) =>
                userService.createUser(organizationId, instanceToPlain(member))
              ),
              toArray(),
              tapResponse({
                next: () => {
                  patchState(store, {
                    isLoading: false,
                    members: [],
                    member: null,
                  });

                  snackbarService.openSnackBar(
                    'Members created successfully',
                    undefined
                  );

                  OnMemberSuccess.emit(true);
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });

                  snackbarService.openSnackBar(
                    'Error inviting members',
                    undefined
                  );

                  OnMemberError.emit(error.message);
                },
              })
            );
          })
        )
      ),

      fetchOrganization: rxMethod<{ organizationId: string }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true
            })
          }),
          switchMap(({ organizationId }) => {
            return organizationService.fetchOrganization(organizationId).pipe(
              tapResponse({
                next: (response) => {
                  if(response.code == 200) {
                    patchState(store, {
                      isLoading: false,
                      createdOrganization: plainToInstance(OrganizationDto, response.data)
                    })
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message
                  })
                }
              })
            )
          })
        )
      )
    })
  )
);
