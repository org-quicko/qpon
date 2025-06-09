import { inject, Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserStore } from '../store/user.store';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<any> {
  authService = inject(AuthService);
  userStore = inject(UserStore);

  constructor(private router: Router) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userId = this.authService.getUserId();

    if (userId) {
      this.userStore.fetchUser({ userId });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
