import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrganizationsStore } from './store/organizations.store';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrganizationMvDto } from '../../../dtos/organizationsMv.dto';
import { PaginationOptions } from '../../types/PaginatedOptions';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSortModule, Sort } from '@angular/material/sort';
import { sortOrderEnum } from '../../../enums';
import { CustomDatePipe } from '../../pipe/date.pipe';

@Component({
  selector: 'app-super-admin-organizations',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    CustomDatePipe
  ],
  providers: [OrganizationsStore],
  templateUrl: './super-admin-organizations.component.html',
  styleUrls: ['./super-admin-organizations.component.css'],
})
export class SuperAdminOrganizationsComponent implements OnInit {
  columns = ['name', 'totalCoupons', 'totalMembers', 'createdAt', 'navigate'];
  searchControl: FormControl;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  paginationOptions = signal<PaginationOptions>({
    pageIndex: 0,
    pageSize: 10,
  });

  sortOptions = signal<{ active: 'createdAt'; direction: 'asc' | 'desc' }>({
    active: 'createdAt',
    direction: 'desc',
  });

  datasource = new MatTableDataSource<OrganizationMvDto>();

  organizationsStore = inject(OrganizationsStore);

  organizations = this.organizationsStore.organizations;
  count = this.organizationsStore.count;
  isLoading = this.organizationsStore.isLoading;

  constructor(private router: Router) {
    this.searchControl = new FormControl('');

    effect(() => {
      const organizations = this.organizations() ?? [];
      const { pageIndex, pageSize } = this.paginationOptions();

      const start = pageIndex * pageSize;
      const end = Math.min(start + pageSize, organizations.length);

      this.datasource.data = organizations.slice(start, end);
    });
  }

  ngOnInit() {
    this.organizationsStore.resetLoadedPages();

    this.organizationsStore.fetchOrganizations({
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: string) => {
        this.paginationOptions.set({
          pageIndex: 0,
          pageSize: 10,
        });

        this.organizationsStore.resetLoadedPages();

        this.organizationsStore.fetchOrganizations({
          filter: {
            name: value.trim(),
          },
        });
      });
  }

  onRowClick(organization: OrganizationMvDto) {
    this.router.navigate([`/${organization.organizationId}/home/dashboard`]);
  }

  onCreateOrganization() {
    this.router.navigate(['/organizations/create']);
  }

  onPageChange(event: PageEvent) {
    this.paginationOptions.set({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.organizationsStore.fetchOrganizations({
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
      skip: event.pageIndex * event.pageSize,
      take: this.paginationOptions().pageSize,
    });
  }

  onSortChange(event: Sort) {
    this.paginationOptions.set({
      pageIndex: 0,
      pageSize: 10
    })

    this.organizationsStore.resetLoadedPages();

    this.organizationsStore.resetOrganizations();
    
    this.sortOptions.set({
      active: 'createdAt',
      direction: event.direction as 'asc' | 'desc'
    });

    this.organizationsStore.fetchOrganizations({
      sortOptions: {
        sortBy: this.sortOptions().active,
        sortOrder:
          this.sortOptions().direction == 'asc'
            ? sortOrderEnum.ASC
            : sortOrderEnum.DESC,
      },
      isSortOperation: true
    });
  }
}
