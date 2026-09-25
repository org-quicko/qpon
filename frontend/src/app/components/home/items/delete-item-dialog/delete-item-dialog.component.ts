import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-item-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-item-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./delete-item-dialog.component.css']
})
export class DeleteItemDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
