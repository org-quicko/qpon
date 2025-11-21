import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../../../store/user.store';
import { FormDialogBoxComponent } from '../../../common/form-dialog-box/form-dialog-box.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { SnackbarService } from '../../../../../services/snackbar.service';

@Component({
    selector: 'app-edit-profile-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FormDialogBoxComponent,
        MatIcon
    ],
    templateUrl: './edit-profile-dialog.component.html'
})
export class EditProfileDialogComponent {

    userStore = inject(UserStore);
    fb = inject(FormBuilder);
    snack = inject(SnackbarService);

    visibility = {
        current: false,
        new: false,
        confirm: false
    };

    form = this.fb.group({
        email: ['', Validators.required],
        name: ['', Validators.required],
        currentPassword: [''],
        newPassword: [''],
        confirmPassword: ['']
    },
        { validators: this.passwordMatchValidator }
    );

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<EditProfileDialogComponent>
    ) {
        this.form.patchValue({
            email: data.email,
            name: data.name,
        });
    }

    passwordMatchValidator(form: any) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        // clear old errors
        form.get('confirmPassword')?.setErrors(null);

        // no passwords → no error
        if (!newPassword && !confirmPassword) return null;

        if (newPassword !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        return null;
    }

    toggleVisibility(field: 'current' | 'new' | 'confirm') {
        this.visibility[field] = !this.visibility[field];
    }

    save = () => {
        if (this.form.invalid) return;

        const currentPassword = this.form.value.currentPassword;
        const newPassword = this.form.value.newPassword;

        if (currentPassword && !newPassword) {
            this.snack.openSnackBar("Please enter new password.", "Close");
            return; // DO NOT close dialog
        }

        if (!currentPassword && newPassword) {
            this.snack.openSnackBar("Please enter current password.", "Close");
            return; // DO NOT close dialog
        }

        if (this.form.hasError('passwordMismatch')) {
            this.snack.openSnackBar("Passwords do not match.", "Close");
            return;
        }

        // Build body
        const body: any = {
            email: this.form.value.email!,
            name: this.form.value.name!,
        };

        // ✔ Only add passwords if both are entered
        if (currentPassword && newPassword) {
            body.currentPassword = currentPassword;
            body.newPassword = newPassword;
        }

        // Call user store update
        this.userStore.updateUser({
            organizationId: this.data.organizationId,
            userId: this.data.userId,
            body
        });

        // Close dialog ONLY when valid
        this.dialogRef.close();
    };
}
