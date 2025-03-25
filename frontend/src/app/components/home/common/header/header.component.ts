import { Component, inject } from '@angular/core';
import { ChooseOrganizationComponent } from "./choose-organization/choose-organization.component";
import { ProfileComponent } from "./profile/profile.component";
import { OrganizationStore } from '../../../../store/organization.store';

@Component({
  selector: 'app-header',
  imports: [ProfileComponent, ChooseOrganizationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly organizationStore = inject(OrganizationStore);
}
