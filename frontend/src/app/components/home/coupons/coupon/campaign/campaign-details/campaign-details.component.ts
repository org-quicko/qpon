import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { CampaignSummaryRow } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
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
import { NotAllowedDialogBoxComponent } from '../../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import {
  UserAbility,
  UserAbilityTuple,
} from '../../../../../../permissions/ability';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import {
  CampaignDto,
  UpdateCampaignDto,
} from '../../../../../../../dtos/campaign.dto';
import { ChangeStatusComponent } from '../campaign-change-status-dialog/campaign-change-status-dialog';
import { InactiveMessageDialogComponent } from '../../../../common/inactive-message-dialog/inactive-message-dialog.component';
import { campaignStatusEnum } from '../../../../../../../enums';
import { SnackbarService } from '../../../../../../services/snackbar.service';

@Component({
  selector: 'app-campaign-details',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgxSkeletonLoaderModule,
    NgClass,
    TitleCasePipe,
    CustomDatePipe,
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

  private readonly abilityService =
    inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
  protected readonly can = this.abilityService.can;
  private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(private router: Router, private route: ActivatedRoute, private snackbarService: SnackbarService) {}

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
    if (this.can('update', UpdateCampaignDto)) {
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
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openDeleteDialog() {
    if (this.can('delete', CampaignDto)) {
      this.dialog.open(DeleteDialogComponent, {
        autoFocus: false,
        data: {
          title: `Delete ‘${this.campaign()?.getName()}’ campaign?`,
          description: `Are you sure you want to delete ‘${this.campaign()?.getName()}’? All coupon codes associated with this campaign will be deleted!`,
          onDelete: () =>
            this.campaignStore.deleteCampaign({
              organizationId: this.organization()?.organizationId!,
              couponId: this.coupon()?.couponId!,
              campaignId: this.campaign()?.getCampaignId()!,
            }),
        },
      });
    } else {
      const rule = this.ability.relevantRuleFor('delete', CampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openNotAllowedDialogBox(restrictionReason: string) {
    this.dialog.open(NotAllowedDialogBoxComponent, {
      data: {
        description: restrictionReason,
      },
    });
  }

  openChangeStatusDialog(campaign: CampaignSummaryRow) {
    if (this.can('update', UpdateCampaignDto)) {
      if(this.campaign()?.getStatus() === campaignStatusEnum.EXHAUSTED) {
        this.dialog.open(InactiveMessageDialogComponent, {
          autoFocus: false,
          data: {
            title: 'Campaign exhausted!',
            description:
              'You can’t mark this campaign as active because the campaign is marked exhausted.',
          },
        });
      } else {
        this.dialog.open(ChangeStatusComponent, {
          data: {
            couponId: this.couponStore.coupon.data()?.couponId,
            campaign,
            deactivateCampaign: this.campaignStore.deactivateCampaign,
            activateCampaign: this.campaignStore.activateCampaign,
          },
          autoFocus: false,
        });
      }
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCampaignDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  
  openInvactiveMessageDialogForCampaign() {
    this.dialog.open(InactiveMessageDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Coupon inactive!',
        description:
          'You can’t create campaign because the coupon is marked inactive.',
      },
    });
  }
}
