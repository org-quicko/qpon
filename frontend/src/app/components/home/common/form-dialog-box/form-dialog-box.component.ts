import { NgClass } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-form-dialog-box',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgClass
  ],
  templateUrl: './form-dialog-box.component.html',
  styleUrls: ['./form-dialog-box.component.css']
})
export class FormDialogBoxComponent implements OnDestroy {

  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) onSubmit!: () => void;

  @Input() width?: string;
  @Input() height?: string;

  @Input({ required: true }) icon!: string;
  @Input({ required: true }) headerText!: string;

  @Input() cancelBtnText: string = 'Cancel';
  @Input() submitBtnText: string = 'Submit';

  @Input() isLoading: boolean = false;

  /** Reference of parent dialog from parent component */
  @Input() dialogRefParent?: MatDialogRef<any>;

  destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeDialog(): void {
    this.dialogRefParent?.close();
  }
}
