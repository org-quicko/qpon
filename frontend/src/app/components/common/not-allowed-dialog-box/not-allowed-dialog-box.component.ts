import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-not-allowed-dialog-box',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './not-allowed-dialog-box.component.html',
  styleUrls: ['./not-allowed-dialog-box.component.css']
})
export class NotAllowedDialogBoxComponent {
  data = inject(MAT_DIALOG_DATA);
}
