import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { ItemStore, onItemSuccess } from '../store/item.store';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationStore } from '../../../../../store/organization.store';
import { Router } from '@angular/router';
import { CreateItemDto } from '../../../../../../dtos/item.dto';

@Component({
  selector: 'app-add-more',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './add-more.component.html',
  styleUrls: ['./add-more.component.css']
})
export class AddMoreComponent {
  @Output() currentScreenEvent = new EventEmitter<string>();
  @Output() itemToEditEvent = new EventEmitter<{item: CreateItemDto, index: number}>();

  itemStore = inject(ItemStore);
  organizationStore = inject(OrganizationStore);

  items = this.itemStore.items;
  organization = this.organizationStore.organizaiton;
  isNextClicked = this.itemStore.onNext;
  isBackClicked = this.itemStore.onBack;

  constructor(private router: Router) {
    effect(() => {
      if(this.isBackClicked()) {
        this.itemStore.setOnBack();
        this.itemStore.previousStep();
        this.currentScreenEvent.emit('create-item');
      }

      if(this.isNextClicked()) {
        this.itemStore.createItems({
          organizationId: this.organization()?.organizationId!,
          items: this.itemStore.items()!
        })

        onItemSuccess.subscribe((res) => {
          if(res) {
            this.router.navigate([`/${this.organization()?.organizationId}/home/items`])
          }
        })
      }
    })
  }

  onAddMore() {
    this.itemStore.resetItem();
    this.currentScreenEvent.emit('create-item');
  }

  onEditItem(item: CreateItemDto, index: number) {
    this.itemToEditEvent.emit({item, index});
  }
}
