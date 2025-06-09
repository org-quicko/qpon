import { effect, inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrganizationUserStore } from '../store/organization-user.store';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserResolver implements Resolve<any> {

  authService = inject(AuthService);
  organizationUserStore = inject(OrganizationUserStore);

  organizations = this.organizationUserStore.organizations;

  constructor(private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userId = this.authService.getUserId();
    this.organizationUserStore.fetchOrganizationsForUser({userId: userId!});

      // // Watch for changes in the store
      // effect(() => {
      //   const organizations = this.organizationUserStore.organizations();
        
      //   if (!this.organizationUserStore.isLoading()) {
  
      //     if (organizations.length === 1) {
      //       this.router.navigate([`/${organizations[0].organizationId}/home/dashboard`]);
      //     }
      //   }
      // });
  
      // // Return organizations (if needed) or null if redirected
      // return this.organizationUserStore.organizations();
  }
}
