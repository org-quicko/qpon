import { Component, inject, OnInit } from '@angular/core';
import { AvatarModule } from 'ngx-avatars';
import { UserStore } from '../../../../../store/user.store';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationUserStore } from '../../../../../store/organization-user.store';
import { OrganizationStore } from '../../../../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AvatarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  role: any;
  selectedThemePreference: any;


  userStore = inject(UserStore);
  organizationUserStore = inject(OrganizationUserStore);
  organizationStore = inject(OrganizationStore);

  user = this.userStore.user;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.getRole();
  }

  changeTheme(event: MatButtonToggleChange) {
    //TODO: add support for switching theme
  }

  getRole() {
    this.organizationUserStore.organizations().map((organization) => {
      if (
        organization.organizationId ==
        this.organizationStore.organizaiton()?.organizationId
      ) {
        this.role = organization.role;
      }
    });
  }

  logout() {
    this.authService.deleteCookie();
    window.location.href = environment.dashboard_host + "login"
  }
}
