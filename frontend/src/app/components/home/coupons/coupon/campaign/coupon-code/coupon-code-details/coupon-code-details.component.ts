import { Component, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CouponCodeDto } from '../../../../../../../../dtos/coupon-code.dto';
import { TitleCasePipe } from '@angular/common';
import { CustomDatePipe } from '../../../../../../../pipe/date.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-coupon-code-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    TitleCasePipe,
    CustomDatePipe,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './coupon-code-details.component.html',
  styleUrls: ['./coupon-code-details.component.css'],
})
export class CouponCodeDetailsComponent implements OnInit {
  @Input() couponCode!: Signal<CouponCodeDto | null>;
  @Input() isLoading!: Signal<boolean | null>;

  constructor() {}

  ngOnInit() {}
}
