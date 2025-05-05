import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CouponDto, UpdateCouponDto } from '../../../../../../dtos/coupon.dto';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrganizationStore } from '../../../../../store/organization.store';
import { ChangeStatusComponent } from '../../change-status/change-status.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDatePipe } from '../../../../../pipe/date.pipe';
import { DeleteDialogComponent } from '../../../common/delete-dialog/delete-dialog.component';
import { CouponStore, OnCouponSuccess } from '../store/coupon.store';
import { UserAbility, UserAbilityTuple } from '../../../../../permissions/ability';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { NotAllowedDialogBoxComponent } from '../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';

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
    CustomDatePipe,
  ],
  templateUrl: './coupon-details.component.html',
  styleUrl: './coupon-details.component.css',
})
export class CouponDetailsComponent implements OnInit {
  @Input() coupon!: Signal<CouponDto | null>;
  @Input() isLoading!: Signal<boolean | null>;

  readonly dialog = inject(MatDialog);
  organizationStore = inject(OrganizationStore);
  couponStore = inject(CouponStore);

  organization = this.organizationStore.organizaiton;

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    OnCouponSuccess.subscribe((res) => {
      if(res) {
        this.dialog.closeAll();
        this.router.navigate(['../'], { relativeTo: this.route })
      }
    })
  }

  getFormattedDate(date: Date) {
    return new Date(date).toDateString();
  }

  openDialog(coupon: CouponDto) {
    if(this.can('delete', CouponDto)) {
      this.dialog.open(DeleteDialogComponent, {
        data: {
          title: `Delete ‘${coupon.name}’ coupon?`,
          description: `Are you sure you want to delete ‘${coupon.name}’? All campaigns and coupon codes associated with this coupon will be deleted!`,
          onDelete: () =>
            this.couponStore.deleteCoupon({
              organizationId: this.organization()?.organizationId!,
              couponId: coupon.couponId!,
            }),
        },
        autoFocus: false,
      });
    } else {
      const rule = this.ability.relevantRuleFor('delete', CouponDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  onEdit() {
    if(this.can('update', UpdateCouponDto)) {
      this.router.navigate(
        [
          `/${this.organization()?.organizationId}/coupons/${
            this.coupon()?.couponId
          }/edit`,
        ],
        {
          queryParams: {
            redirect: btoa(this.router.url),
          },
        }
      );
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  openNotAllowedDialogBox(restrictionReason: string) {
		this.dialog.open(NotAllowedDialogBoxComponent, {
			data: {
				description: restrictionReason,
			}
		});
	}
}
