import { Component, inject, OnInit } from '@angular/core';
import { OrganizationUserStore } from '../../store/organization-user.store';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-organizations',
  imports: [
    MatListModule,
    MatIconModule,
    MatDividerModule,
    CommonModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css',
})
export class OrganizationsComponent {
  organizationUserStore = inject(OrganizationUserStore);

  organizations = this.organizationUserStore.organizations;
  isLoading = this.organizationUserStore.isLoading;

  constructor(private router: Router) {}

  onClick(organizationId: string) {
    this.router.navigate([`/${organizationId}/home/dashboard`]);
  }
}
