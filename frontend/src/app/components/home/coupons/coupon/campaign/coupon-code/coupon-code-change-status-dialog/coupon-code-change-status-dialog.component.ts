import { Component, inject, OnInit } from '@angular/core';
import { onChangeStatusSuccess } from '../store/coupon-code.store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coupon-code-change-status-dialog',
  imports: [MatButtonModule],
  templateUrl: './coupon-code-change-status-dialog.component.html',
  styleUrls: ['./coupon-code-change-status-dialog.component.css']
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
    onChangeStatusSuccess.subscribe((success) => {
        this.dialogRef.close();
    });
  }
}
