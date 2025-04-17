import { Component, OnInit } from '@angular/core';
import { CreateItemComponent } from './create-item/create-item.component';
import { ItemStore } from './store/item.store';
import { AddMoreComponent } from './add-more/add-more.component';

@Component({
  selector: 'app-create-items',
  imports: [CreateItemComponent, AddMoreComponent],
  templateUrl: './create-items.component.html',
  styleUrls: ['./create-items.component.css']
})
export class CreateItemsComponent implements OnInit {
  currentScreen = 'create-item';

  constructor() { }

  ngOnInit() {
  }

  changeScreen(value: string) {
    if(value == 'add-more') {
      this.currentScreen = 'add-more';
    } else {
      this.currentScreen = 'create-item'
    }
  }

}
