import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Params } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { MatRippleModule } from '@angular/material/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { take } from 'rxjs';
import { OrganizationUserStore } from '../../../../../store/organization-user.store';
import { OrganizationDto } from '../../../../../../dtos/organization.dto';
import { OrganizationUserDto } from '../../../../../../dtos/organization-user.dto';

@Component({
  selector: 'app-choose-organization',
  imports: [
    MatIconModule,
    MatMenuModule,
    CommonModule,
    AvatarModule,
    MatRippleModule,
    NgxSkeletonLoaderModule,
    TitleCasePipe
  ],
  templateUrl: './choose-organization.component.html',
  styleUrl: './choose-organization.component.css',
})
export class ChooseOrganizationComponent implements OnInit {
  organizations: any;
  currentOrganizationId: any
  currentOrganization = signal<OrganizationUserDto | null>(null)

  organizationUserStore = inject(OrganizationUserStore);

  isLoading = this.organizationUserStore.isLoading;

  constructor(private route: ActivatedRoute) {
    this.organizations = this.organizationUserStore.organizations()
    this.currentOrganizationId = "";
  }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params: Params) => {
      this.currentOrganizationId = params['organization_id']
    })
    this.getOrganizations()
  }

  getOrganizations() {
    this.organizations = this.organizationUserStore.organizations()
    this.organizations.map((organization: OrganizationDto) => {
      if(organization.organizationId == this.currentOrganizationId) {
        this.currentOrganization.set(organization);
      }
    })
  }

  changeOrganization(organization: OrganizationDto) {
    window.location.href = `${window.location.origin}/` + organization.organizationId + "/home/dashboard";
  }
}
