import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-inactive-message-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './inactive-message-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./inactive-message-dialog.component.css']
})
export class InactiveMessageDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
