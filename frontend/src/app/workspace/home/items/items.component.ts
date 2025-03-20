import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface Item {
  name: string;
  description: string;
}

const ITEM_DATA: Item[] = [
  { description:"1", name: 'Hydrogen' },
  { description:"2", name: 'Helium' },
  { description:"3", name: 'Lithium' },
  { description:"4", name: 'Beryllium' },
  { description:"5", name: 'Boron' },
  { description:"6", name: 'Carbon' },
  { description:"7", name: 'Nitrogen' },
  { description:"8", name: 'Oxygen' },
  { description:"9", name: 'Fluorine' },
  { description:"0", name: 'Neon' },
];

@Component({
  selector: 'app-items',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css',
})
export class ItemsComponent {
  columns = ["name", "description", "menu"];
  data = ITEM_DATA;
}
