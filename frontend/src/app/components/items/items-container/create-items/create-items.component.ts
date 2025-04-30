import { Component, OnInit } from '@angular/core';
import { CreateItemComponent } from './create-item/create-item.component';
import { ItemStore } from './store/item.store';
import { AddMoreComponent } from './add-more/add-more.component';
import { CreateItemDto } from '../../../../../dtos/item.dto';

@Component({
  selector: 'app-create-items',
  imports: [CreateItemComponent, AddMoreComponent],
  templateUrl: './create-items.component.html',
  styleUrls: ['./create-items.component.css']
})
export class CreateItemsComponent {
  item?: CreateItemDto;
  index?: number;
  currentScreen = 'create-item';

  changeScreen(value: string) {
    if(value == 'add-more') {
      this.item = undefined;
      this.currentScreen = 'add-more';
    } else {
      this.currentScreen = 'create-item'
    }
  }

  editItemforPrefilling(value: {item: CreateItemDto, index: number}){
    this.item = value.item;
    this.index = value.index;
    this.currentScreen = 'create-item';
  }
}
