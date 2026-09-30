import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from "./common/header/header.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidenavComponent } from "./common/sidenav/sidenav.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, RouterModule, SidenavComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
