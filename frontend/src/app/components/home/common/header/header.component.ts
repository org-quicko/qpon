import { Component, inject } from '@angular/core';
import { ChooseOrganizationComponent } from "./choose-organization/choose-organization.component";
import { ProfileComponent } from "./profile/profile.component";
import { OrganizationStore } from '../../../../store/organization.store';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../../../services/theme.service';
import { Theme } from '../../../../../enums';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatDividerModule, ProfileComponent, ChooseOrganizationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly organizationStore = inject(OrganizationStore);
  readonly themeService = inject(ThemeService);
  private router = inject(Router);

  logoPath: string = '/assets/logo-light.svg';

  constructor() {
    // reactively update logo
    this.themeService.theme$.subscribe(theme => {
      let resolvedTheme = theme;

      if (theme === Theme.SYSTEM) {
        resolvedTheme = this.themeService.getSystemThemePreference();
      }

      this.logoPath = resolvedTheme === Theme.DARK
        ? '/assets/logo-dark.svg'
        : '/assets/logo-light.svg';
    });
  }

    navigateHome() {
    const orgId = this.organizationStore.organizaiton()?.organizationId;
    this.router.navigate([`/${orgId}/home/dashboard`]);
  }
}
