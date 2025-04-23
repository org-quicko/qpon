import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { ItemsStore, OnItemSuccess } from '../../../store/items.store';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemDto } from '../../../../dtos/item.dto';
import { OrganizationStore } from '../../../store/organization.store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { PaginationOptions } from '../../../types/PaginatedOptions';
import { MatDialog } from '@angular/material/dialog';
import { DeleteItemDialogComponent } from './delete-item-dialog/delete-item-dialog.component';

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
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    CommonModule,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css',
})
export class ItemsComponent implements OnInit {
  columns = ['name', 'description', 'menu'];

  searchControl = new FormControl('');
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  isFilterApplied: boolean = false;
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10
  });

  deleteDialog = inject(MatDialog);
  itemsStore = inject(ItemsStore);
  organizationStore = inject(OrganizationStore);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.isFilterApplied = false;

    effect(() => {
      const items = this.itemsStore.items();
      const { pageIndex, pageSize } = this.paginationOptions();

      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, items.length);

      this.itemsDatasource.data = items.slice(start, end);
    })
  }

  organization = this.organizationStore.organizaiton;

  itemsDatasource = new MatTableDataSource<ItemDto>();

  items = this.itemsStore.items;
  count = this.itemsStore.count!;
  take = this.itemsStore.take!;
  isLoading = this.itemsStore.isLoading;

  onEdit(item: ItemDto) {
    this.router.navigate([`../../items/${item.itemId}/edit`], {
      relativeTo: this.route,
    });
  }

  onDelete(item: ItemDto) {
    this.itemsStore.deleteItem({
      organizationId: this.organizationStore.organizaiton()?.organizationId!,
      itemId: item.itemId!,
    });
  }

  ngOnInit(): void {
    this.itemsStore.resetLoadedPages();
    this.itemsStore.resetItems();

    this.itemsStore.fetchItems({
      organizationId: this.organization()?.organizationId!,
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((name) => {
        this.isFilterApplied = true;
        this.itemsStore.fetchItems({
          organizationId: this.organization()?.organizationId!,
          filter: {
            query: name
          },
        });
      });

      OnItemSuccess.subscribe((res) => {
        if(res) {
          this.deleteDialog.closeAll();
          this.itemsStore.resetItems();
          this.paginationOptions.set({
            pageIndex: 0,
            pageSize: 10
          })
          this.ngOnInit();
        }
      })
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({ pageIndex: event.pageIndex, pageSize: event.pageSize });

    this.itemsStore.fetchItems({
      organizationId: this.organization()?.organizationId!,
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
    });
  }

  onAddItem() {
    this.router.navigate([`/${this.organization()?.organizationId}/items/create`])
  }

  openDeleteDialog(item: ItemDto) {
    this.deleteDialog.open(DeleteItemDialogComponent, {
      autoFocus: false,
      data: {
        organizationId: this.organization()?.organizationId,
        item: item,
        onDelete: this.itemsStore.deleteItem
      }
    })
  }
}
