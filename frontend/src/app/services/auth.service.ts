import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private cookieService: CookieService) {
    this.authenticated = new BehaviorSubject(this.isAuthenticated());
  }

  authenticated: BehaviorSubject<any>;
  jwtHelper: JwtHelperService = new JwtHelperService();

  getAuthenticated() {
    return this.authenticated.asObservable();
  }

  setAuthenticated(isAuthenticated: any) {
    this.authenticated.next(isAuthenticated);
  }

  public setToken(token: string): void {
    this.cookieService.set(
      'QPON_ACCESS_TOKEN',
      token,
      1,
      '/',
      undefined,
      false,
      'Lax'
    );
  }

  public deleteCookie() {
    this.cookieService.delete('QPON_ACCESS_TOKEN', '/', undefined, false, 'Lax');
  }

  public getToken(): string {
    return this.cookieService.get('QPON_ACCESS_TOKEN');
  }

  public getUserId(): string | null {
    if (this.getToken() != null && this.getToken() != '') {
      const jwtToken = this.jwtHelper.decodeToken(this.getToken());
      return jwtToken['sub'];
    }
    return null;
  }

  public isAuthenticated(): boolean {
    try {
      const jwtToken = this.getToken();
      if (jwtToken != null) {
        const token = jwtToken.split('.');
        if (
          token &&
          this.jwtHelper.decodeToken(jwtToken) &&
          !this.jwtHelper.isTokenExpired(jwtToken)
        ) {
          return true;
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  getTokenExpiry(token: string): Date {
    return this.jwtHelper.getTokenExpirationDate(token)!;
  }

  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }
}
