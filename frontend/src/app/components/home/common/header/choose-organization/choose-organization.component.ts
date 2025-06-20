import { CommonModule, NgIf, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { MatRippleModule } from '@angular/material/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { take } from 'rxjs';
import { OrganizationUserStore } from '../../../../../store/organization-user.store';
import { OrganizationDto } from '../../../../../../dtos/organization.dto';
import { OrganizationUserDto } from '../../../../../../dtos/organization-user.dto';
import { OrganizationStore } from '../../../../../store/organization.store';
import { PermissionsService } from '../../../../../services/permission.service';

@Component({
  selector: 'app-choose-organization',
  imports: [
    MatIconModule,
    MatMenuModule,
    CommonModule,
    AvatarModule,
    MatRippleModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './choose-organization.component.html',
  styleUrl: './choose-organization.component.css',
})
export class ChooseOrganizationComponent implements OnInit {
  currentOrganizationId: any
  currentOrganization = signal<OrganizationUserDto | null>(null)

  organizationUserStore = inject(OrganizationUserStore);

  organizationStore = inject(OrganizationStore);
  

  isLoading = this.organizationUserStore.isLoading;
  organizations = this.organizationUserStore.organizations
  organization = this.organizationStore.organizaiton;

  constructor(private route: ActivatedRoute, private permissionService: PermissionsService, private router: Router) {
    this.currentOrganizationId = "";

    effect(() => {
      if(this.organizations().length > 0) {
        this.getOrganizations()
      }
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.currentOrganizationId = params['organization_id']
    })
  }

  getOrganizations() {
    this.organizations().map((organization: OrganizationUserDto) => {
      if(organization.organizationId == this.currentOrganizationId) {
        this.currentOrganization.set(organization);
        this.permissionService.setAbilityForRole(organization.role!)
      }
    })
  }

  changeOrganization(organization: OrganizationDto) {
    window.location.href = `${window.location.origin}/` + organization.organizationId + "/home/dashboard";
  }

  onViewAllOrganization() {
    this.router.navigate(['/organizations']);
  }
}
