import { Component, effect, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CouponCodeDto, UpdateCouponCodeDto } from '../../../../../../../../dtos/coupon-code.dto';
import { TitleCasePipe } from '@angular/common';
import { CustomDatePipe } from '../../../../../../../pipe/date.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationStore } from '../../../../../../../store/organization.store';
import { CustomerCouponCodeStore } from '../store/customer-coupon-code.store';
import { customerConstraintEnum } from '../../../../../../../../enums';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { NotAllowedDialogBoxComponent } from '../../../../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { UserAbility, UserAbilityTuple } from '../../../../../../../permissions/ability';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { UpdateCustomerCouponCodeDto } from '../../../../../../../../dtos/customer-coupon-code.dto';

@Component({
  selector: 'app-coupon-code-details',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
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

  couponId: string;
  campaignId: string;
  couponCodeId: string;
  customerConstraint: string;

  dialog = inject(MatDialog);

  organizationStore = inject(OrganizationStore);
  customerCouponCodeStore = inject(CustomerCouponCodeStore);

  organization = this.organizationStore.organizaiton;
  customers = this.customerCouponCodeStore.data;

  private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;
	private readonly ability = inject<PureAbility<UserAbilityTuple>>(PureAbility);


  constructor(private route: ActivatedRoute, private router: Router) {
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
    this.customerConstraint = '';

    effect(() => {
      if(this.couponCode()) {
        this.customerConstraint = this.couponCode()?.customerConstraint == customerConstraintEnum.ALL ? 'all' : 'specific';
      }
    })
    
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    })
  }

  onEditCodeDetails() {
    if(this.can('update', UpdateCouponCodeDto)) {
      this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.couponId}/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/code-details`], {
        queryParams: {
          'redirect': btoa(this.router.url)
        }
      })
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponCodeDto);
      this.openNotAllowedDialogBox(rule?.reason!);
    }
  }

  onEditCustomerConstraint() {
    if(this.can('update', UpdateCouponCodeDto)) {
      this.router.navigate([`/${this.organization()?.organizationId}/coupons/${this.couponId}/campaigns/${this.campaignId}/coupon-codes/${this.couponCodeId}/edit/customer-constraint`], {
        queryParams: {
          'redirect': btoa(this.router.url)
        }
      })
    } else {
      const rule = this.ability.relevantRuleFor('update', UpdateCouponCodeDto);
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
