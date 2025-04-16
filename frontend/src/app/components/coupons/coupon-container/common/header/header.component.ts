import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationStore } from '../../../../../store/organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-coupon-code-creation-header',
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  redirectUri: string;

  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  
  constructor(private router: Router, private route: ActivatedRoute) {
    this.redirectUri = '';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect']
    })
  }

  onExit() {
    if(this.redirectUri) {
      this.router.navigate([atob(this.redirectUri)]);
    } else {
      this.router.navigate([`${this.organization()?.organizationId}/home/coupons`]);
    }
  }
}
