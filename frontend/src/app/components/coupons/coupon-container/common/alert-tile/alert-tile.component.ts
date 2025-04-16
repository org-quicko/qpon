import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-tile',
  imports: [MatIconModule],
  templateUrl: './alert-tile.component.html',
  styleUrls: ['./alert-tile.component.css']
})
export class AlertTileComponent {

  @Input() text!: string;

}
