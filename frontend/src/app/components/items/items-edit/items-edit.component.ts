import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { UpdateItemDto } from '../../../../dtos/item.dto';
import { HeaderComponent } from '../common/header/header.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-items-edit',
  templateUrl: './items-edit.component.html',
  styleUrl: './items-edit.component.css',
  imports: [
    HeaderComponent,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class ItemsEditComponent {
  editItemForm: FormGroup;

  constructor(private fb: RxFormBuilder) {
    this.editItemForm = fb.formGroup(UpdateItemDto);
  }
}
