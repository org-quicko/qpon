import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateItemDto } from '../../../../../../dtos/item.dto';
import { MatIconModule } from '@angular/material/icon';
import { NgFor } from '@angular/common';
import { ItemStore } from '../store/item.store';

@Component({
  selector: 'app-create-item',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    NgFor,
  ],
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css'],
})
export class CreateItemComponent {
  @Output() currentScreenEvent = new EventEmitter<string>();

  createItemForm: FormGroup;

  itemStore = inject(ItemStore);

  isNextClicked = this.itemStore.onNext;

  constructor(private formBuilder: RxFormBuilder) {
    this.createItemForm = formBuilder.formGroup(new CreateItemDto());

    this.createItemForm.setControl(
      'customFields',
      this.formBuilder.array([
        {
          key: '',
          value: '',
        },
      ])
    );

    effect(() => {
      if (this.isNextClicked()) {
        this.itemStore.setOnNext();
        this.createItemForm.markAllAsTouched();

        if (this.createItemForm.invalid) {
          return;
        }
        
        this.setItem();
        this.itemStore.nextStep();
        this.currentScreenEvent.emit('add-more');
      }
    });
  }

  get customFields(): FormArray<FormGroup> {
    return this.createItemForm.get('customFields') as FormArray<FormGroup>;
  }

  addCustomField(): void {
    const fieldGroup = this.formBuilder.group({
      key: [''],
      value: [''],
    });
    this.customFields.push(fieldGroup);
  }

  removeCustomField(index: number): void {
    this.customFields.removeAt(index);
  }

  getCustomFieldsAsObject(): { [key: string]: string } {
    const result: Record<string, string> = {};
    this.customFields.controls.forEach((control) => {
      const key = control.get('key')?.value;
      const value = control.get('value')?.value;
      if (key) result[key] = value;
    });
    return result;
  }

  setItem(): void {
    const createItem = new CreateItemDto();
    createItem.name = this.createItemForm.value['name'];
    createItem.description =
      this.createItemForm.value['description'] ?? undefined;
    createItem.externalId = this.createItemForm.value['externalId'];
    createItem.customFields = this.getCustomFieldsAsObject() ?? undefined;
    this.itemStore.setItem(createItem);
  }
}
