import {
    Component,
    OnInit,
    effect,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationUsersStore } from './store/organization-users.store';
import { UpdateUserRoleDto, UserDto } from '../../../../../dtos/user.dto';
import { OrganizationStore } from '../../../../store/organization.store';
import { CustomDatePipe } from '../../../../pipe/date.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AddEditUserDialogComponent } from './add-edit-user-dialog/add-edit-user-dialog.component';
import { DeleteDialogComponent } from '../../common/delete-dialog/delete-dialog.component';
import { SnackbarService } from '../../../../services/snackbar.service';
import { NotAllowedDialogBoxComponent } from '../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { AbilityServiceSignal } from '@casl/angular';
import { UserAbility } from '../../../../permissions/ability';
import { UserStore } from '../../../../store/user.store';

@Component({
    selector: 'app-team-users',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        CustomDatePipe,
    ],
    templateUrl: './team.component.html',
})
export class TeamUsersComponent implements OnInit {
    columns = ['name', 'email', 'role', 'joinedOn', 'menu'];

    usersStore = inject(OrganizationUsersStore);
    userStore = inject(UserStore);
    organizationStore = inject(OrganizationStore);
    dialog = inject(MatDialog);
    snack = inject(SnackbarService);

    private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
    protected readonly can = this.abilityService.can;

    pagination = signal({
        pageIndex: 0,
        pageSize: 10,
    });

    dataSource = new MatTableDataSource<UserDto>([]);

    constructor() {
        effect(() => {
            const list = this.usersStore.users();

            if (list?.getItems()) {
                this.dataSource.data = list.getItems() as any;
            }
        });
    }

    ngOnInit(): void {
        this.usersStore.fetchOrganizationUsers({
            organizationId: this.organizationStore.organizaiton()?.organizationId as string,
            skip: 0,
            take: 10,
        });
    }

    openNotAllowedDialogBox(restrictionReason: string) {
        this.dialog.open(NotAllowedDialogBoxComponent, {
            data: {
                description: restrictionReason,
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.pagination.set({
            pageIndex: event.pageIndex,
            pageSize: event.pageSize,
        });

        this.usersStore.fetchOrganizationUsers({
            organizationId: this.organizationStore.organizaiton()?.organizationId as string,
            skip: event.pageIndex * event.pageSize,
            take: event.pageSize,
        });
    }

    onEdit(user: UserDto) {

        const hasPermission = this.can('update', UpdateUserRoleDto);

        if (!hasPermission) {
            this.openNotAllowedDialogBox('You do not have permission to update member.');
            return;
        }
        this.dialog.open(AddEditUserDialogComponent, {
            width: '520px',
            data: {
                organizationId: this.organizationStore.organizaiton()?.organizationId,
                user: user
            }
        });
    }


    onDelete(user: UserDto) {
        const org = this.organizationStore.organizaiton();
        const currentUserId = this.userStore.user()?.userId;

        const hasPermission = this.can('delete', UpdateUserRoleDto);

        if (!hasPermission) {
            this.openNotAllowedDialogBox('You do not have permission to remove member.');
            return;
        }

        if (currentUserId === user?.userId) {
            this.snack.openSnackBar('You cannot delete yourself', undefined);
            return;
        }

        this.dialog.open(DeleteDialogComponent, {
            width: '448px',
            data: {
                title: `Remove ${user?.name} from ${org?.name}?`,
                description: `Are you sure you want to remove ${user?.name} from ${org?.name}? They will lose all access.`,
                onDelete: async () => {
                    try {
                        await this.usersStore.deleteUser({ organizationId: org?.organizationId!, userId: user?.userId! });
                        this.dialog.closeAll();

                    } catch (err) {
                        this.snack.openSnackBar('Failed to remove member', undefined);
                    }
                }
            }
        });
    }

    onAddClick() {

        const hasPermission = this.can('create', UpdateUserRoleDto);

        if (!hasPermission) {
            this.openNotAllowedDialogBox('You do not have permission to create the member.');
            return;
        }
        this.dialog.open(AddEditUserDialogComponent, {
            width: '520px',
            data: {
                organizationId: this.organizationStore.organizaiton()?.organizationId
            }
        });
    }

}
