import { Component } from '@angular/core';
import { HeaderComponent } from "./common/header/header.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidenavComponent } from "./common/sidenav/sidenav.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, RouterModule, SidenavComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
