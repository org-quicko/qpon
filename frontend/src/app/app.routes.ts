import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { OrganizationsComponent } from './components/organizations/organizations.component';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { CustomersComponent } from './components/home/customers/customers.component';
import { ItemsComponent } from './components/home/items/items.component';
import { ReportsComponent } from './components/home/reports/reports.component';
import { CouponsComponent } from './components/home/coupons/coupons.component';
import { HomeComponent } from './components/home/home.component';
import { OrganizationUserResolver } from './resolvers/organization-user.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { CouponComponent } from './components/home/coupons/coupon/coupon.component';
import { CampaignComponent } from './components/home/coupons/coupon/campaign/campaign.component';
import { CouponCodeComponent } from './components/home/coupons/coupon/campaign/coupon-code/coupon-code.component';
import { CouponContainerComponent } from './components/coupons/coupon-container/coupon-container.component';
import { CreateCouponComponent } from './components/coupons/coupon-container/create-coupon/create-coupon.component';
import { EditItemsComponent } from './components/coupons/coupon-container/edit-items/edit-items.component';
import { CreateCampaignComponent } from './components/coupons/coupon-container/create-campaign/create-campaign.component';
import { CreateCouponCodeComponent } from './components/coupons/coupon-container/create-coupon-code/create-coupon-code.component';
import { EditCouponComponent } from './components/coupons/coupon-container/edit-coupon/edit-coupon.component';
import { EditCampaignComponent } from './components/coupons/coupon-container/edit-campaign/edit-campaign.component';
import { EditCouponCodeComponent } from './components/edit-coupon-code/edit-coupon-code.component';
import { UpdateCodeDetailsComponent } from './components/edit-coupon-code/update-code-details/update-code-details.component';
import { UpdateCustomerConstraintComponent } from './components/edit-coupon-code/update-customer-constraint/update-customer-constraint.component';
import { ItemsContainerComponent } from './components/items/items-container/items-container.component';
import { CreateItemsComponent } from './components/items/items-container/create-items/create-items.component';
import { EditItemComponent } from './components/items/edit-item/edit-item.component';
import { EditCustomerComponent } from './components/customers/edit-customer/edit-customer.component';
import { CreateCustomersContainerComponent } from './components/customers/create-customers-container/create-customers-container.component';
import { CreateCustomersComponent } from './components/customers/create-customers-container/create-customers/create-customers.component';
import { SuperAdminOrganizationsComponent } from './components/super-admin-organizations/super-admin-organizations.component';
import { DynamicComponentLoaderComponent } from './components/dynamic-component-loader/dynamic-component-loader.component';
import { CreateOrganizationContainerComponent } from './components/create-organization-container/create-organization-container.component';
import { CreateOrganizationComponent } from './components/create-organization-container/create-organization/create-organization.component';
import { InviteTeamComponent } from './components/create-organization-container/invite-team/invite-team.component';
import { SuccessComponent } from './components/create-organization-container/success/success.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    resolve: { user: UserResolver, organizations: OrganizationUserResolver },
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'organizations' },
      {
        path: 'organizations',
        component: DynamicComponentLoaderComponent,
        data: {
          SuperAdminOrganizationsComponent: SuperAdminOrganizationsComponent,
          OrganizationsComponent: OrganizationsComponent,
        },
      },
      { 
        path: 'organizations/create', 
        component: CreateOrganizationContainerComponent,
        children: [
          {
            path: '', component: CreateOrganizationComponent
          },
          {
            path: ':organization_id/invite', component: InviteTeamComponent
          },
          {
            path: ':organization_id/success', component: SuccessComponent
          }
        ] 
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
                  },
                  {
                    path: ':coupon_id/campaigns/:campaign_id',
                    component: CampaignComponent,
                  },
                  {
                    path: ':coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id',
                    component: CouponCodeComponent,
                  },
                ],
              },
            ],
          },
          {
            path: 'coupons',
            component: CouponContainerComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'create' },
              { path: 'create', component: CreateCouponComponent },
              {
                path: ':coupon_id',
                children: [
                  { path: 'items/edit', component: EditItemsComponent },
                  { path: 'edit', component: EditCouponComponent },
                  {
                    path: 'campaigns',
                    children: [
                      { path: '', pathMatch: 'full', redirectTo: 'create' },
                      { path: 'create', component: CreateCampaignComponent },
                      {
                        path: ':campaign_id',
                        children: [
                          { path: 'edit', component: EditCampaignComponent },
                          {
                            path: 'coupon-codes',
                            children: [
                              {
                                path: 'create',
                                component: CreateCouponCodeComponent,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'coupons/:coupon_id/campaigns/:campaign_id/coupon-codes/:coupon_code_id/edit',
            component: EditCouponCodeComponent,
            children: [
              {
                path: 'code-details',
                component: UpdateCodeDetailsComponent
              },
              {
                path: 'customer-constraint',
                component: UpdateCustomerConstraintComponent
              }
            ]
          },
          {
            path: 'customers',
            component: CreateCustomersContainerComponent,
            children: [
              { path: 'create', component: CreateCustomersComponent },
            ],
          },
          { path: 'customers/:customer_id/edit', component: EditCustomerComponent },
          {
            path: 'items',
            component: ItemsContainerComponent,
            children: [
              { path: 'create', component: CreateItemsComponent },
            ],
          },
          { path: 'items/:item_id/edit', component: EditItemComponent },
        ],
      },
    ],
  },
];
