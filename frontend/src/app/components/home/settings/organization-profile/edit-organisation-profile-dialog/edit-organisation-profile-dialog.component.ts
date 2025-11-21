import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormDialogBoxComponent } from '../../../common/form-dialog-box/form-dialog-box.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { OrganizationStore } from '../../../../../store/organization.store';
import { OrganizationResolver } from '../../../../../resolvers/organization.resolver';

@Component({
    selector: 'app-edit-organisation-profile-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FormDialogBoxComponent
    ],
    templateUrl: './edit-organisation-profile-dialog.component.html'
})
export class EditOrganisationProfileDialogComponent {

    fb = inject(FormBuilder);
    snack = inject(SnackbarService);
    organizationResolver = inject(OrganizationResolver);

    form = this.fb.group({
        name: ['', Validators.required]
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<EditOrganisationProfileDialogComponent>
    ) {
        this.form.patchValue({
            name: data.name
        });
    }

    save = async () => {
        if (this.form.invalid) return;

        const body = {
            name: this.form.value.name!
        };

        try {
            await this.organizationResolver.update(this.data.organizationId, body);

            this.snack.openSnackBar('Organization updated successfully', undefined);
            this.dialogRef.close();

        } catch (err) {
            this.snack.openSnackBar('Failed to update organization', undefined);
        }
    };

}
