import { Component, Input, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DateRangeFilterComponent } from '../../../../layouts/range-selector/date-range-filter.component';
import { OrganizationStore } from '../../../../store/organization.store';

@Component({
  selector: 'app-dashboard-sales-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    DateRangeFilterComponent,
  ],
  templateUrl: './sales-analytics.component.html',
  styleUrls: ['./sales-analytics.component.css'],
})
export class DashboardSalesAnalyticsComponent implements OnInit {
  @Input() userName: string | null = null;

  @Input() stats = {
    totalRedemptions: 0,
    grossSales: 0,
    discount: 0,
    discountPercent: 0,
    netSales: 0,
  };

  private organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;

  currentDate = new Date();

  ngOnInit() {}
}
