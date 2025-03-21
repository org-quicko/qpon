import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface Contact { name: string; email: string; phoneNumber: string }

const CONTACT_DATA: Contact[] = [
  { name: 'Alice Johnson', email: 'alice.johnson@example.com', phoneNumber: '123-456-7890' },
  { name: 'Bob Smith', email: 'bob.smith@example.com', phoneNumber: '234-567-8901' },
  { name: 'Charlie Davis', email: 'charlie.davis@example.com', phoneNumber: '345-678-9012' },
  { name: 'David Wilson', email: 'david.wilson@example.com', phoneNumber: '456-789-0123' },
  { name: 'Emma Brown', email: 'emma.brown@example.com', phoneNumber: '567-890-1234' },
  { name: 'Franklin White', email: 'franklin.white@example.com', phoneNumber: '678-901-2345' },
  { name: 'Grace Lee', email: 'grace.lee@example.com', phoneNumber: '789-012-3456' },
  { name: 'Henry Adams', email: 'henry.adams@example.com', phoneNumber: '890-123-4567' },
  { name: 'Isabella Martinez', email: 'isabella.martinez@example.com', phoneNumber: '901-234-5678' },
  { name: 'Jack Taylor', email: 'jack.taylor@example.com', phoneNumber: '012-345-6789' },
];


@Component({
  selector: 'app-customers',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  columns = ["name", "email", "phoneNumber", "menu"]
  data = CONTACT_DATA
}