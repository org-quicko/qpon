import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrganizationStore } from '../../../../store/organization.store';
import { EditOrganisationProfileDialogComponent } from './edit-organisation-profile-dialog/edit-organisation-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../common/delete-dialog/delete-dialog.component';
import { SnackbarService } from '../../../../services/snackbar.service';
import { OrganizationResolver } from '../../../../resolvers/organization.resolver';
import { NotAllowedDialogBoxComponent } from '../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { UserAbility } from '../../../../permissions/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { CreateOrganizationDto, OrganizationDto } from '../../../../../dtos/organization.dto';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    NgxSkeletonLoaderModule
],
  templateUrl: './organization-profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./organization-profile.component.css']
})
export class OrganizationProfileComponent {

  organizationStore = inject(OrganizationStore);
  dialog = inject(MatDialog);
  snack = inject(SnackbarService);
  organizationResolver = inject(OrganizationResolver);

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
  protected readonly can = this.abilityService.can;

  openNotAllowedDialogBox(restrictionReason: string) {
    this.dialog.open(NotAllowedDialogBoxComponent, {
      data: {
        description: restrictionReason,
      }
    });
  }

  onEditName() {

    const hasPermission = this.can('update', OrganizationDto);

    if (!hasPermission) {
      this.openNotAllowedDialogBox('You do not have permission to edit organisation details.');
      return;
    }

    this.dialog.open(EditOrganisationProfileDialogComponent, {
      width: '516px',
      data: {
        name: this.organizationStore.organizaiton()?.name,
        organizationId: this.organizationStore.organizaiton()?.organizationId,
      }
    });
  }

  /**
   * An organization with coupons still switched on cannot be deleted, and the
   * API says how many and what to do about it — worth repeating verbatim,
   * because "Failed to delete organization" leaves you with nowhere to go.
   */
  private deletionFailureMessage(error: unknown): string {
    const fallback = 'Failed to delete organization';

    if (!(error instanceof HttpErrorResponse) || error.status !== 409) {
      return fallback;
    }

    return error.error?.message ?? fallback;
  }

  onDeleteOrganisation() {
    const org = this.organizationStore.organizaiton();

    const hasPermission = this.can('delete', CreateOrganizationDto);

    if (!hasPermission) {
      this.openNotAllowedDialogBox('You do not have permission to delete organisation.');
      return;
    }

    this.dialog.open(DeleteDialogComponent, {
      width: '448px',
      data: {
        title: 'Delete organisation?',
        description: `Are you sure you want to delete organisation “${org?.name}”? You will lose all the associated data.`,
        onDelete: async () => {
          try {
            await this.organizationResolver.delete(org!.organizationId as string);

            this.snack.openSnackBar(
              'Organization deleted successfully',
              undefined
            );
            this.dialog.closeAll();
            window.location.href = window.location.origin + "/organizations";

          } catch (err) {
            this.snack.openSnackBar(this.deletionFailureMessage(err), undefined);
          }
        }
      }
    });
  }
}
