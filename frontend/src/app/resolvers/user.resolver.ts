import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {
  
  authService = inject(AuthService);

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userId = this.authService.getUserId();
    
  }
}
