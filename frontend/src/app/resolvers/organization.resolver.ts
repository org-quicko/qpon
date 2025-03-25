import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { plainToClass } from 'class-transformer';
import { OrganizationDto } from '../../dtos/organization.dto';
import { OrganizationStore } from '../store/organization.store';

@Injectable({
  providedIn: 'root'
})
export class OrganizationResolver implements Resolve<any> {
  
  organizationService = inject(OrganizationService);
  organizationStore = inject(OrganizationStore);

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const response = await firstValueFrom(this.organizationService.fetchOrganization(route.params['organization_id']))
     this.organizationStore.setOrganization(plainToClass(OrganizationDto, response.data))
  }
}
