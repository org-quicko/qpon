import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CouponDto } from '../../../../../../dtos/coupon.dto';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrganizationStore } from '../../../../../store/organization.store';
import { ChangeStatusComponent } from '../../change-status/change-status.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDatePipe } from '../../../../../pipe/date.pipe';

@Component({
  selector: 'app-coupon-details',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgClass,
    NgxSkeletonLoaderModule,
    TitleCasePipe,
    CurrencyPipe,
    CustomDatePipe
  ],
  templateUrl: './coupon-details.component.html',
  styleUrl: './coupon-details.component.css',
})
export class CouponDetailsComponent {
  @Input() coupon!: Signal<CouponDto | null>;
  @Input() isLoading!: Signal<boolean | null>;

  readonly dialog = inject(MatDialog);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;

  constructor(private router: Router, private route: ActivatedRoute) {}

  getFormattedDate(date: Date) {
    return new Date(date).toDateString();
  }

  openDialog(coupon: CouponDto) {
    this.dialog.open(ChangeStatusComponent, {
      data: { coupon, organizationId: this.organization()?.organizationId },
      autoFocus: false,
    });
  }

  onEdit() {
    this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.coupon()?.couponId}/edit`], {
      queryParams: {
        'redirect': btoa(this.router.url)
      }
    })
  }
}
