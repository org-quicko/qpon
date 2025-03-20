import { Component } from '@angular/core';
import { ChooseOrganizationComponent } from "./choose-organization/choose-organization.component";
import { ProfileComponent } from "./profile/profile.component";

@Component({
  selector: 'app-header',
  imports: [ProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
