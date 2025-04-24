import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OrganizationsStore } from './store/organizations.store';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrganizationMvDto } from '../../../dtos/organizationsMv.dto';
import { PaginationOptions } from '../../types/PaginatedOptions';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-super-admin-organizations',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [OrganizationsStore],
  templateUrl: './super-admin-organizations.component.html',
  styleUrls: ['./super-admin-organizations.component.css'],
})
export class SuperAdminOrganizationsComponent implements OnInit {
  columns = ['name', 'totalCoupons', 'totalMembers', 'createdAt', 'navigate'];
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });

  datasource = new MatTableDataSource<OrganizationMvDto>();

  organizationsStore = inject(OrganizationsStore);

  organizations = this.organizationsStore.organizations;
  count = this.organizationsStore.count;
  isLoading = this.organizationsStore.isLoading;

  constructor(private router: Router) {
    effect(() => {
      const organizations = this.organizations()!;
      const { pageIndex, pageSize } = this.paginationOptions();

      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, organizations.length);

      this.datasource.data = organizations.slice(start, end);
    });
  }

  ngOnInit() {
    this.organizationsStore.fetchOrganizations({});
  }

  onRowClick(organization: OrganizationMvDto) {
    this.router.navigate([`/${organization.organizationId}/home/dashboard`]);
  }
}
