import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { HeaderComponent } from '../common/header/header.component';
import { SidenavComponent } from '../common/sidenav/sidenav.component';

@Component({
  selector: 'app-reports',
  imports: [MatIcon],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent {}
