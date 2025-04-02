import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CouponsStore } from '../../../../store/coupons.store';
@Component({
  selector: 'app-change-status',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './change-status.component.html',
  styleUrl: './change-status.component.css'
})
export class ChangeStatusComponent {
  readonly dialogRef = inject(MatDialogRef<ChangeStatusComponent>);
  readonly data = inject(MAT_DIALOG_DATA)

  couponsStore = inject(CouponsStore);

  onActivate() {
    this.couponsStore.activateCoupon({organizationId: this.data.organizationId, couponId: this.data.coupon.couponId});
    this.dialogRef.close();
  }

  onDeactivate() {
    this.couponsStore.deactivateCoupon({organizationId: this.data.organizationId, couponId: this.data.coupon.couponId});
    this.dialogRef.close();
  }
}
