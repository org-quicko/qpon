import { Component, effect, inject, OnInit } from '@angular/core';
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
import { ThemeService } from '../../../../../services/theme.service';
import { Theme } from '../../../../../../enums';
import { Observable, Subject, takeUntil } from 'rxjs';

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
  theme$!: Observable<Theme>;
  destroy$ = new Subject<void>();


  userStore = inject(UserStore);
  organizationUserStore = inject(OrganizationUserStore);
  organizationStore = inject(OrganizationStore);

  user = this.userStore.user;
  organizations = this.organizationUserStore.organizations;

  constructor(private router: Router, private authService: AuthService, private themeService: ThemeService) {
    this.selectedThemePreference = Theme.SYSTEM

    effect(() => {
      if(this.organizations()) {
        this.getRole()
      }
    })
  }

  ngOnInit() {
    this.theme$ = this.themeService.theme$;

    this.theme$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.selectedThemePreference = res
    })
  }

  changeTheme(event: MatButtonToggleChange) {
    this.themeService.setTheme(event.value)
  }

  getRole() {
    this.organizations().map((organization) => {
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
    window.location.href = window.location.origin + "/login"
  }

  goToSettings() {
    const orgId = this.organizationStore.organizaiton()?.organizationId;
    this.router.navigate([orgId, 'home', 'settings']);
  }
}
