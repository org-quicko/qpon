import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterOutlet } from '@angular/router';
import { CouponStore } from './store/coupon.store';
import { CampaignStore } from './store/campaign.store';
import { CouponCodeStore } from './store/coupon-code.store';
import { OrganizationStore } from '../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { ProgressBarComponent } from '../../layouts/progress-bar/progress-bar.component';
import { CustomersStore } from './store/customers.store';
import { CustomerCouponCodeStore } from './store/customer-coupon-code.store';
import { filter } from 'rxjs';

@Component({
  selector: 'app-edit-coupon-code',
  imports: [RouterOutlet, ProgressBarComponent, MatButtonModule],
  providers: [
    CouponStore,
    CampaignStore,
    CouponCodeStore,
    CustomersStore,
    CustomerCouponCodeStore,
  ],
  templateUrl: './edit-coupon-code.component.html',
  styleUrls: ['./edit-coupon-code.component.css'],
})
export class EditCouponCodeComponent implements OnInit {
  couponId: string;
  campaignId: string;
  couponCodeId: string;
  redirectUri: string;
  hideBackButton = signal<boolean>(false);

  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);
  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);
  customerCouponCodeStore = inject(CustomerCouponCodeStore);

  coupon = this.couponStore.data;
  campaign = this.campaignStore.data;
  couponCode = this.couponCodeStore.data;
  organization = this.organizationStore.organizaiton;
  customerCouponCode = this.customerCouponCodeStore.data;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
    this.redirectUri = '';
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect'];

      if(this.redirectUri) {
        this.hideBackButton.set(true);
      }
    });

    this.updateBackButtonVisibility(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBackButtonVisibility(event.urlAfterRedirects);
      });

    if (this.coupon() == null) {
      this.couponStore.fetchCoupon({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
      });
    }

    if (this.campaign() == null) {
      this.campaignStore.fetchCampaign({
        couponId: this.couponId,
        campaignId: this.campaignId,
      });
    }

    if (this.couponCode() == null) {
      this.couponCodeStore.fetchCouponCode({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        campaignId: this.campaignId,
        couponCodeId: this.couponCodeId,
      });
    }

    if(!this.customerCouponCode()) {
      this.customerCouponCodeStore.fetchCustomersForCouponCode({
        couponId: this.couponId,
        campaignId: this.campaignId,
        couponCodeId: this.couponCodeId
      })
    }
  }

  private updateBackButtonVisibility(url: string) {
    const shouldHide = url.includes('code-details') || this.redirectUri.length > 0;
    this.hideBackButton.set(shouldHide);
  }

  onExit() {
    if (this.redirectUri) {
      this.router.navigate([atob(this.redirectUri)]);
    } else {
      this.router.navigate([
        `/${this.organization()?.organizationId}/home/coupons/${
          this.couponId
        }/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}`,
      ]);
    }
  }

  getFillPercentage() {
    if (this.router.url.includes('code-details')) return 50;

    if (this.router.url.includes('customer-constraint')) return 100;

    return 0;
  }

  onBack() {
    this.couponCodeStore.setOnBack();
  }

  onNext() {
    this.couponCodeStore.setOnNext();
  }

  getButtonText() {
    if(this.router.url.includes('customer-constraint') || this.redirectUri) {
      return "Save"
    }

    return "Next"
  }
}
