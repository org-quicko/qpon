import { Component, effect, inject, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationStore } from '../../../store/organization.store';
import { ItemStore, onItemSuccess } from '../items-container/create-items/store/item.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { UpdateItemDto } from '../../../../dtos/item.dto';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { instanceToPlain } from 'class-transformer';

@Component({
  selector: 'app-edit-item',
  imports: [
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    NgFor
  ],
  providers: [ItemStore],
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css'],
})
export class EditItemComponent implements OnInit {
  itemId: string;
  updateItemForm: FormGroup;

  organizationStore = inject(OrganizationStore);
  itemStore = inject(ItemStore);

  organization = this.organizationStore.organizaiton;
  item = this.itemStore.item;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: RxFormBuilder
  ) {
    this.itemId = '';
    this.updateItemForm = formBuilder.formGroup(new UpdateItemDto());

    this.updateItemForm.setControl(
      'customFields',
      this.formBuilder.array([
        {
          key: '',
          value: '',
        },
      ])
    );

    effect(() => {
      if (this.item()) {
        this.updateItemForm.patchValue({
          name: this.item()?.name,
          description: this.item()?.description,
          externalId: this.item()?.externalId,
        });

        const customFields = this.item()?.customFields ?? {};

        // Clear existing form array
        this.customFields.clear();
    
        // Convert customFields object to FormGroups
        Object.entries(customFields).forEach(([key, value]) => {
          this.customFields.push(
            this.formBuilder.group({
              key: [key],
              value: [value],
            })
          );
        });
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.itemId = params['item_id'];
    });

    this.itemStore.fetchItem({
      organizationId: this.organization()?.organizationId!,
      itemId: this.itemId,
    });

    onItemSuccess.subscribe((res) => {
      if(res) {
        this.router.navigate([`/${this.organization()?.organizationId}/home/items`]);
      }
    })
  }

  onExit() {
    this.router.navigate([
      `/${this.organization()?.organizationId}/home/items`,
    ]);
  }

  get customFields(): FormArray<FormGroup> {
    return this.updateItemForm.get('customFields') as FormArray<FormGroup>;
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

  onSave() {
    const updateItem = new UpdateItemDto();
    updateItem.name = this.updateItemForm.value['name'];
    updateItem.description = this.updateItemForm.value['description'] ?? undefined;
    updateItem.externalId = this.updateItemForm.value['externalId'];
    updateItem.customFields = this.getCustomFieldsAsObject();

    this.itemStore.updateItem({
      organizationId: this.organization()?.organizationId!,
      itemId: this.itemId,
      body: instanceToPlain(updateItem)
    });
  }
}
