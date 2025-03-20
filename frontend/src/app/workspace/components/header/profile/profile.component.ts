import { Component } from '@angular/core';
import { AvatarModule } from 'ngx-avatars';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
