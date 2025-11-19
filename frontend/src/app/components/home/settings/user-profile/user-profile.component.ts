import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { UserStore } from '../../../../store/user.store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { EditProfileDialogComponent } from './edit-profile-dialog/edit-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationStore } from '../../../../store/organization.store';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {

  userStore = inject(UserStore);
  dialog = inject(MatDialog);
  organizationStore = inject(OrganizationStore);

  onEditProfile() {
    this.dialog.open(EditProfileDialogComponent, {
      width: '516px',
      data: {
        email: this.userStore.user()?.email,
        name: this.userStore.user()?.name,
        userId: this.userStore.user()?.userId,
        organizationId: this.organizationStore.organizaiton()?.organizationId,
      }
    });
  }
}
