import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationStore } from '../../../../store/organization.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private router: Router) {}

  readonly organizationStore = inject(OrganizationStore);

  onExit() {

    this.router.navigate([`/${this.organizationStore.organizaiton()?.organizationId}/home/items`])
  }
}
