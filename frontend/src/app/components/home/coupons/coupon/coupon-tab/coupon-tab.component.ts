import { Component, Input, Signal, ChangeDetectionStrategy } from '@angular/core';
import { MatTabsModule } from "@angular/material/tabs";
import { CouponDto } from '../../../../../../dtos/coupon.dto';
import { CampaignsComponent } from "./campaigns/campaigns.component";
import { EligibleItemsComponent } from "./eligible-items/eligible-items.component";

@Component({
  selector: 'app-coupon-tab',
  imports: [MatTabsModule, CampaignsComponent, EligibleItemsComponent],
  templateUrl: './coupon-tab.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './coupon-tab.component.css',
})
export class CouponTabComponent {
  @Input() coupon!: Signal<CouponDto | null>;
}
