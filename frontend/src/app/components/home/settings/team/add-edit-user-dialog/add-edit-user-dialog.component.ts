import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { OrganizationUsersStore } from '../store/organization-users.store';
import { FormDialogBoxComponent } from '../../../common/form-dialog-box/form-dialog-box.component';
import { roleEnum } from '../../../../../../enums';
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-add-edit-user-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormDialogBoxComponent,
        MatIcon
    ],
    templateUrl: './add-edit-user-dialog.component.html'
})
export class AddEditUserDialogComponent {

    fb = inject(FormBuilder);
    snack = inject(SnackbarService);
    userStore = inject(OrganizationUsersStore);

    roles = ['admin', 'editor', 'viewer'];
    isEditMode = false;

    form = this.fb.group({
        role: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        password: [''],
        confirmPassword: ['']
    },
        { validators: this.passwordMatchValidator.bind(this) });
    visibility = {
        password: false,
        confirmPassword: false
    };


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AddEditUserDialogComponent>
    ) {
        this.isEditMode = !!data?.user;

        if (this.isEditMode) {
            // EDIT MODE
            this.form.patchValue({
                role: data.user.role,
                email: data.user.email,
                name: data.user.name,
            });
            this.form.get('password')?.clearValidators();
            this.form.get('confirmPassword')?.clearValidators();
            this.form.setValidators(null);

        } else {
            this.form.get('password')?.setValidators([Validators.required]);
            this.form.get('confirmPassword')?.setValidators([Validators.required]);
            this.form.setValidators(this.passwordMatchValidator.bind(this));
        }
        this.form.updateValueAndValidity();
    }

    passwordMatchValidator(group: any) {
        const passCtrl = group.get('password');
        const confirmCtrl = group.get('confirmPassword');

        if (!passCtrl || !confirmCtrl) return null;

        const pass = passCtrl.value;
        const confirm = confirmCtrl.value;

        if (pass && confirm && pass !== confirm) {
            confirmCtrl.setErrors({ passwordMismatch: true });
        } else {
            // clear only passwordMismatch
            if (confirmCtrl.errors?.passwordMismatch) {
                confirmCtrl.setErrors(null);
            }
        }

        return null;
    }


    ngOnInit() {
        this.form.get('password')?.valueChanges.subscribe(() => {
            this.form.updateValueAndValidity({ onlySelf: false });
        });

        this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
            this.form.updateValueAndValidity({ onlySelf: false });
        });
    }



    toggleVisibility(field: 'password' | 'confirmPassword') {
        this.visibility[field] = !this.visibility[field];
    }

    save = () => {
        if (this.form.invalid) return;

        const orgId = this.data.organizationId;

        if (!this.isEditMode) {

            const body = {
                email: this.form.value.email!,
                name: this.form.value.name!,
                password: this.form.value.password!,
                role: this.form.value.role! as roleEnum,
            };

            this.userStore.createUser({ organizationId: orgId, body });
            this.dialogRef.close();
            return;
        }

        const body = {
            role: this.form.value.role! as roleEnum,
            email: this.form.value.email!,
            name: this.form.value.name!,
        };

        this.userStore.updateUserRole({
            organizationId: orgId,
            userId: this.data.user.userId,
            body
        });

        this.dialogRef.close();
    };
}
