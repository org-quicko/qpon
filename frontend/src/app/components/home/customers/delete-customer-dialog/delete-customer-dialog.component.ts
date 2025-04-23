import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-customer-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-customer-dialog.component.html',
  styleUrls: ['./delete-customer-dialog.component.css']
})
export class DeleteCustomerDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
