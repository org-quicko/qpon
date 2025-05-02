import { Component, effect, inject, OnInit } from '@angular/core';
import { CreateOrganizationStore } from '../store/create-organization.store';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationUserStore } from '../../../store/organization-user.store';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-success',
  imports: [MatIconModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  organizationId: string;

  createOrganizationStore = inject(CreateOrganizationStore);
  organizationUserStore = inject(OrganizationUserStore);
  userStore = inject(UserStore);

  createdOrganization = this.createOrganizationStore.createdOrganization;
  isNextClicked = this.createOrganizationStore.onNext;
  user = this.userStore.user;

  constructor(private router: Router, private route: ActivatedRoute) { 
    this.organizationId = '';

    effect(() => {
      if(this.isNextClicked()) {
        this.createOrganizationStore.setOnNext();
        this.organizationUserStore.fetchOrganizationsForUser({
          userId: this.user()?.userId!
        })
        this.router.navigate([`/${this.organizationId}/home/dashboard`]);
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.organizationId = params['organization_id'];
    })

    this.createOrganizationStore.fetchOrganization({
      organizationId: this.organizationId
    })
  }

}
