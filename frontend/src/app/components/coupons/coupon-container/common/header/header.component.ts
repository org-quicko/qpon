import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationStore } from '../../../../../store/organization.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coupon-code-creation-header',
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  
  constructor(private router: Router) {}

  onExit() {
    this.router.navigate([`${this.organization()?.organizationId}/home/coupons`]);
  }
}
