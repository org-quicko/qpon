import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserOrganizationsResolver implements Resolve<any> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // Replace with actual data fetching logic
    return of([{ id: 1, name: 'Organization 1' }, { id: 2, name: 'Organization 2' }]);
  }
}
