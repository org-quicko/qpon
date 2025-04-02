import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { OrganizationsComponent } from './components/organizations/organizations.component';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { OrganizationHomeComponent } from './components/organization-home/organization-home.component';
import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { CustomersComponent } from './components/home/customers/customers.component';
import { ItemsComponent } from './components/home/items/items.component';
import { ReportsComponent } from './components/home/reports/reports.component';
import { CouponsComponent } from './components/home/coupons/coupons.component';
import { CouponEditComponent } from './components/coupons/coupon-edit/coupon-edit.component';
import { CouponCreateComponent } from './components/coupons/coupon-create/coupon-create.component';
import { CampaignCreateComponent } from './components/campaigns/campaign-create/campaign-create.component';
import { CampaignEditComponent } from './components/campaigns/campaign-edit/campaign-edit.component';
import { ItemsEditComponent } from './components/items/items-edit/items-edit.component';
import { ItemsCreateComponent } from './components/items/items-create/items-create.component';
import { CustomersCreateComponent } from './components/customers/customers-create/customers-create.component';
import { CustomersEditComponent } from './components/customers/customers-edit/customers-edit.component';
import { HomeComponent } from './components/home/home.component';
import { OrganizationUserResolver } from './resolvers/organization-user.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { CouponComponent } from './components/home/coupons/coupon/coupon.component';
import { CampaignComponent } from './components/home/coupons/coupon/campaign/campaign.component';
// import { UserResolver } from './resolvers/user.resolver';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    resolve: { user: UserResolver, organizations: OrganizationUserResolver },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'organizations',
        component: OrganizationsComponent,
        children: [{ path: 'create', component: OrganizationHomeComponent }],
      },
      {
        resolve: { organization: OrganizationResolver },
        path: ':organization_id',
        children: [
          {
            path: 'home',
            component: HomeComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
              { path: 'dashboard', component: DashboardComponent },
              { path: 'customers', component: CustomersComponent },
              {
                path: 'items',
                children: [{ path: '', component: ItemsComponent }],
              },
              { path: 'reports', component: ReportsComponent },
              {
                path: 'coupons',
                children: [
                  { path: '', component: CouponsComponent },
                  {
                    path: ':coupon_id',
                    component: CouponComponent,
                    children: [
                      {
                        path: 'campaigns/:campaign_id',
                        component: CampaignComponent,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'coupon',
            children: [
              { path: 'create', component: CouponCreateComponent },
              { path: 'edit/:coupon_id', component: CouponEditComponent },
            ],
          },
          {
            path: 'campaign',
            children: [
              { path: 'create', component: CampaignCreateComponent },
              { path: 'edit/:campaign_id', component: CampaignEditComponent },
            ],
          },
          {
            path: 'customer',
            children: [
              { path: 'create', component: CustomersCreateComponent },
              { path: 'edit/:customer_id', component: CustomersEditComponent },
            ],
          },
          {
            path: 'item',
            children: [
              { path: 'create', component: ItemsCreateComponent },
              { path: 'edit/:item_id', component: ItemsEditComponent },
            ],
          },
        ],
      },
    ],
  },
];
