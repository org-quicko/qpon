import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrganizationStore } from '../../../../store/organization.store';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.css']
})
export class OrganizationProfileComponent {

  organizationStore = inject(OrganizationStore);

  onEditName() {
    console.log("Edit organisation name clicked");
  }

  onDeleteOrganisation() {
    console.log("Delete organisation clicked");
  }
}
