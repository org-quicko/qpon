import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { CampaignSummaryRow } from '../../../../../../../generated/sources/campaign_summary_workbook';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgClass, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { CouponStore } from '../../store/coupon.store';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../common/delete-dialog/delete-dialog.component';
import { CampaignStore, OnCampaignSuccess } from '../store/campaign.store';

@Component({
  selector: 'app-campaign-details',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgxSkeletonLoaderModule,
    NgClass,
    TitleCasePipe,
    CustomDatePipe
  ],
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.css'],
})
export class CampaignDetailsComponent implements OnInit {
  @Input() campaign!: Signal<CampaignSummaryRow | null>;
  @Input() isLoading!: Signal<boolean | null>;

  dialog = inject(MatDialog);
  organizationStore = inject(OrganizationStore);
  couponStore = inject(CouponStore);
  campaignStore = inject(CampaignStore);

  organization = this.organizationStore.organizaiton;
  coupon = this.couponStore.coupon.data;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    OnCampaignSuccess.subscribe((res) => {
      if (res) {
        this.dialog.closeAll();
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  getFormattedDate(date: string) {
    return new Date(date).toDateString();
  }

  onEdit() {
    this.router.navigate(
      [
        `/${this.organization()?.organizationId}/coupons/${
          this.coupon()?.couponId
        }/campaigns/${this.campaign()?.getCampaignId()}/edit`,
      ],
      {
        queryParams: {
          redirect: btoa(this.router.url),
        },
      }
    );
  }

   openDeleteDialog() {
      this.dialog.open(DeleteDialogComponent, {
        autoFocus: false,
        data: {
          title: `Delete ‘${this.campaign()?.getName()}’ campaign?`,
          description: `Are you sure you want to delete ‘${this.campaign()?.getName()}’? All coupon codes associated with this campaign will be deleted!`,
          onDelete: () => this.campaignStore.deleteCampaign({
            organizationId: this.organization()?.organizationId!,
            couponId: this.coupon()?.couponId!,
            campaignId: this.campaign()?.getCampaignId()!,
          })
        }
      })
    }
}
