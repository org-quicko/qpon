import { Component } from '@angular/core';
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { OrganizationProfileComponent } from "./organization-profile/organization-profile.component";
import { TeamUsersComponent } from "./team/team.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [MatTabGroup, MatTab, UserProfileComponent, OrganizationProfileComponent, TeamUsersComponent],
})
export class SettingsComponent {
}
