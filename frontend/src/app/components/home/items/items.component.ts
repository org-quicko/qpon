import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ItemsStore } from '../../../store/items.store';
import { ActivatedRoute, Router } from '@angular/router';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ItemDto } from '../../../../dtos/item.dto';
import { OrganizationStore } from '../../../store/organization.store';

@Component({
  selector: 'app-items',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css',
})
export class ItemsComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {}

  columns = ['name', 'description', 'menu'];

  itemsStore = inject(ItemsStore);
  organizationStore = inject(OrganizationStore);

  items = this.itemsStore.items;
  count = this.itemsStore.count!;
  take = this.itemsStore.take!;
  isLoading = this.itemsStore.isLoading;

  onEdit(item: ItemDto) {
    this.router.navigate([`../../items/edit/${item.itemId}`], { relativeTo: this.route })
  }

  onDelete(item: ItemDto) {
    this.itemsStore.deleteItem({organizationId: this.organizationStore.organizaiton()?.organizationId!, itemId: item.itemId!})
  }

  ngOnInit(): void {
    this.itemsStore.fetchItems({organizationId: this.organizationStore.organizaiton()?.organizationId!});
  }
}
