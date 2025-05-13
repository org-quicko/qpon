import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { onChangeStatusSuccess } from '../store/coupon-codes.store';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coupon-codes-change-status',
  imports: [MatButtonModule],
  templateUrl: './coupon-code-change-status.component.html',
  styleUrls: ['./coupon-code-change-status.component.css']
})
export class CouponCodeChangeStatusDialogComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<CouponCodeChangeStatusDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA)
  ;
  isLoading = false;

  onClose() {
    this.dialogRef.close()
  }


  onActivate() {
    this.isLoading = true;
    this.data.activateCouponCode({
      couponId: this.data.couponId,
      campaignId: this.data.campaignId,
      couponCodeId: this.data.couponCode.couponCodeId,
      organizationId: this.data.organizationId
    });
  }

  onDeactivate() {
    this.isLoading = true;
    this.data.deactivateCouponCode({
      couponId: this.data.couponId,
      campaignId: this.data.campaignId,
      couponCodeId: this.data.couponCode.couponCodeId,
      organizationId: this.data.organizationId
    });
  }

  ngOnInit(): void {
    this.isLoading = false;
    onChangeStatusSuccess.subscribe(() => {
      this.dialogRef.close();
    });
  }

}
