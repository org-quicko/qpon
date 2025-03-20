import { Routes } from '@angular/router';
import { HomeComponent } from './workspace/home/home.component';
import { ItemsComponent } from './workspace/home/items/items.component';
import { CustomersComponent } from './workspace/home/customers/customers.component';
import { ReportsComponent } from './workspace/home/reports/reports.component';
import { CouponsComponent } from './workspace/home/coupons/coupons.component';
import { DashboardComponent } from './workspace/home/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'items',
        component: ItemsComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'coupons',
        component: CouponsComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      }
    ]
  },
];
