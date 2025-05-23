import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { OrganizationStore } from '../../../../../store/organization.store';
import {
  CouponCodeStore,
  CreateSuccess,
} from '../../../store/coupon-code.store';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CustomDatePipe } from '../../../../../pipe/date.pipe';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatRippleModule } from '@angular/material/core';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { CreateCouponCodeDto } from '../../../../../../dtos/coupon-code.dto';

@Component({
  selector: 'app-add-more',
  imports: [MatIconModule, MatCardModule, MatButtonModule, MatRippleModule, CustomDatePipe],
  templateUrl: './add-more.component.html',
  styleUrls: ['./add-more.component.css'],
})
export class AddMoreComponent implements OnInit, OnDestroy {
  @Input() createCouponCodeForm!: FormGroup;
  @Output() currentScreenEvent = new EventEmitter<string>();
  @Output() couponCodeToEdit = new EventEmitter<{couponCode: CreateCouponCodeDto}>();

  redirectUri: string;
  destroy$: Subject<void>;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);

  coupon = this.couponCodeStore.coupon.data;
  campaign = this.couponCodeStore.campaign.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;
  organization = this.organizationStore.organizaiton;

  couponCodes = this.couponCodeStore.couponCodes;

  constructor(private router: Router, private route: ActivatedRoute, private snackbarService: SnackbarService) {

    this.redirectUri = '';
    this.destroy$ = new Subject();

    effect(() => {
      if (this.isBackClicked()) {
        this.couponCodeStore.setOnBack();
        this.currentScreenEvent.emit('customer-constraint');
      }
    });

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();

        if(this.couponCodes()?.length == 0) {
          snackbarService.openSnackBar('No coupon codes to create', undefined);
          return;
        }

        this.couponCodeStore.createCouponCodes({
          organizationId: this.organization()?.organizationId!,
          couponId: this.coupon()?.couponId!,
          campaignId: this.campaign()?.campaignId!,
          couponCodes: this.couponCodeStore.couponCodes()!,
          customersMap: this.couponCodeStore.codesWithSpecificCustomers()!,
        });
      }

    });

    effect(() => {
      if (this.isBackClicked()) {
        this.couponCodeStore.setOnBack();
        const prevIndex = this.couponCodeStore.couponCodeScreenIndex() - 1;
        this.couponCodeStore.setCouponCodeScreenIndex(Math.max(prevIndex, 0));
        this.currentScreenEvent.emit('customer-constraint');
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
      this.redirectUri = params['redirect'] ?? '';
    })

    CreateSuccess.subscribe((success) => {
      if (success) {
        if(this.redirectUri.length > 0) {
          this.router.navigate([atob(this.redirectUri)]);
        } else {
          this.router.navigate([
            `/${this.organization()?.organizationId}/home/coupons/${this.coupon()?.couponId}/campaigns/${this.campaign()?.campaignId}`,
          ]);
        }
        this.createCouponCodeForm.reset();
        this.couponCodeStore.setCouponCodeToNull();
        this.couponCodeStore.resetCouponCodes();
      }
    });
  }

  onAddMore() {
    this.couponCodeStore.setCouponCodeToNull();
    this.createCouponCodeForm.reset();
    this.couponCodeStore.resetCouponCodeScreens()
    this.currentScreenEvent.emit('code');
  }

  onRemoveCouponCode(index: number) {
    this.couponCodeStore.removeCouponCode(index)
  }

  onEdit(couponCode: CreateCouponCodeDto, index: number) {
    this.couponCodeToEdit.emit({couponCode});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
