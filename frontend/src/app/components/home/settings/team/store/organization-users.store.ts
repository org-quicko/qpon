import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { UserService } from '../../../../../services/user.service';
import { catchError, concatMap, EMPTY, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { plainToInstance } from 'class-transformer';
import {
    UserDto,
    CreateUserDto,
    UpdateUserRoleDto,
} from '../../../../../../dtos/user.dto';
import { PaginatedList } from '../../../../../../dtos/paginated-list.dto';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { withDevtools } from '@angular-architects/ngrx-toolkit';

type OrganizationUsersState = {
    users: PaginatedList<UserDto> | null;
    isLoading: boolean;
    error: string | null;
};

const initialState: OrganizationUsersState = {
    users: null,
    isLoading: false,
    error: null,
};

export const OrganizationUsersStore = signalStore(
    { providedIn: 'root' },
    withDevtools('organization-users'),
    withState(initialState),

    withMethods((store, userService = inject(UserService), snack = inject(SnackbarService)) => {
        /** ---------------------------------------------------------
         * FETCH USERS OF AN ORGANIZATION
         * --------------------------------------------------------- */
        const fetchOrganizationUsers = rxMethod<{
            organizationId: string;
            skip?: number;
            take?: number;
        }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),

                concatMap(({ organizationId, skip = 0, take = 10 }) =>
                    userService.fetchOrganizationUsers(organizationId, skip, take).pipe(
                        tapResponse({
                            next: (response) => {
                                const list = plainToInstance(
                                    PaginatedList,
                                    response.data
                                );

                                const items = plainToInstance(
                                    UserDto,
                                    list.getItems() ?? []
                                );

                                list.setItems(items);

                                patchState(store, {
                                    users: list as any,
                                    isLoading: false,
                                });
                            },
                            error: (error: any) => {
                                patchState(store, {
                                    isLoading: false,
                                    error: error?.message || 'Failed to load users',
                                });

                                snack.openSnackBar(error?.message || 'Failed to load users', undefined);
                            },
                        }),

                        catchError((error) => {
                            patchState(store, {
                                isLoading: false,
                                error: error?.message || 'Failed to load users',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        );

        /** ---------------------------------------------------------
         * CREATE USER
         * --------------------------------------------------------- */
        const createUser = rxMethod<{
            organizationId: string;
            body: CreateUserDto;
        }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),

                concatMap(({ organizationId, body }) =>
                    userService.createUser(organizationId, body).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, { isLoading: false });

                                snack.openSnackBar('User created successfully', undefined);

                                const pagination = store.users() ?? { skip: 0, take: 10 };

                                fetchOrganizationUsers({
                                    organizationId,
                                    skip: pagination.skip,
                                    take: pagination.take,
                                });
                            },

                            error: (error: any) => {
                                patchState(store, {
                                    isLoading: false,
                                    error: error?.message || 'Failed to create user',
                                });

                                snack.openSnackBar(error?.message || 'Failed to create user', undefined);
                            },
                        }),

                        catchError((error) => {
                            patchState(store, {
                                isLoading: false,
                                error: error?.message || 'Failed to create user',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        );

        /** ---------------------------------------------------------
         * DELETE USER
         * --------------------------------------------------------- */
        const deleteUser = rxMethod<{
            organizationId: string;
            userId: string;
        }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),

                concatMap(({ organizationId, userId }) =>
                    userService.deleteUser(organizationId, userId).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, { isLoading: false });

                                snack.openSnackBar('User deleted successfully', undefined);

                                const pagination = store.users() ?? { skip: 0, take: 10 };
                                
                                fetchOrganizationUsers({
                                    organizationId,
                                    skip: pagination.skip,
                                    take: pagination.take,
                                });
                            },

                            error: (error: any) => {
                                patchState(store, {
                                    isLoading: false,
                                    error: error?.message || 'Failed to delete user',
                                });

                                snack.openSnackBar(error?.message || 'Failed to delete user', undefined);
                            },
                        }),

                        catchError((error) => {
                            patchState(store, {
                                isLoading: false,
                                error: error?.message || 'Failed to delete user',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        );

        /** ---------------------------------------------------------
         * UPDATE USER ROLE
         * --------------------------------------------------------- */
        const updateUserRole = rxMethod<{
            organizationId: string;
            userId: string;
            body: UpdateUserRoleDto;
        }>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),

                concatMap(({ organizationId, userId, body }) =>
                    userService.updateUserRole(organizationId, userId, body).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, { isLoading: false });

                                snack.openSnackBar('Role updated successfully', undefined);

                                const pagination = store.users() ?? { skip: 0, take: 10 };

                                fetchOrganizationUsers({
                                    organizationId,
                                    skip: pagination.skip,
                                    take: pagination.take,
                                });
                            },

                            error: (error: any) => {
                                patchState(store, {
                                    isLoading: false,
                                    error: error?.message || 'Failed to update role',
                                });

                                snack.openSnackBar(error?.message || 'Failed to update role', undefined);
                            },
                        }),

                        catchError((error) => {
                            patchState(store, {
                                isLoading: false,
                                error: error?.message || 'Failed to update role',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        );

        return {
            fetchOrganizationUsers,
            createUser,
            deleteUser,
            updateUserRole,
        };
    })
);
