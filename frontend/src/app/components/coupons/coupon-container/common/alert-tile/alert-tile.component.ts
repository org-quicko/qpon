import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-tile',
  imports: [MatIconModule],
  templateUrl: './alert-tile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./alert-tile.component.css']
})
export class AlertTileComponent {

  @Input() text!: string;

}
