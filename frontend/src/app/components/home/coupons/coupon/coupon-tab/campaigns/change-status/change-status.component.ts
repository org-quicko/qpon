import { Component, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CampaignsStore } from '../store/campaigns.store';
import { onChangeStatusSuccess } from '../store/campaigns.store';

@Component({
  selector: 'app-campaigns-change-status',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './change-status.component.html',
  styleUrl: './change-status.component.css',
})
export class ChangeStatusComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ChangeStatusComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  isLoading = false;


  onActivate() {
    this.isLoading = true;
    this.data.activateCampaign({
      couponId: this.data.couponId,
      campaignId: this.data.campaign.getCampaignId(),
    });
  }

  onDeactivate() {
    this.isLoading = true;
    this.data.deactivateCampaign({
      couponId: this.data.couponId,
      campaignId: this.data.campaign.getCampaignId(),
    });
  }

  ngOnInit(): void {
    this.isLoading = false;
    onChangeStatusSuccess.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
      }
    });
  }
}
