import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './common/header/header.component';
import { ProgressBarComponent } from '../../../layouts/progress-bar/progress-bar.component';
import { CouponCodeStore } from '../store/coupon-code.store';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-coupon-container',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ProgressBarComponent,
    MatButtonModule,
  ],
  providers: [CouponCodeStore],
  templateUrl: './coupon-container.component.html',
  styleUrls: ['./coupon-container.component.css'],
})
export class CouponContainerComponent implements OnInit, OnDestroy {
  destroy$: Subject<void>;
  currentStep: number = 1;
  uri: string = '';
  steps: Record<string, number> = {
    create: 1,
    'items/edit': 2,
    'campaigns/create': 3,
    'coupon-codes/create': 4,
  };
  redirectUri: string;
  hideBackButton = signal<boolean>(false);

  couponCodeStore = inject(CouponCodeStore);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.redirectUri = '';
    this.destroy$ = new Subject();

    effect(() => {
      if (
        this.couponCodeStore.currentStep() == 0 ||
        this.couponCodeStore.currentStep() == 2 ||
        (this.couponCodeStore.currentStep() == 3 &&
          (this.couponCodeStore.couponCodeScreenIndex() == 0 || this.couponCodeStore.couponCodeScreenIndex() == 3))
      ) {
        this.hideBackButton.set(true);
      } else {
        this.hideBackButton.set(false);
      }
    });
  }

  ngOnInit() {
    this.uri = this.router.url;

    this.router.events.subscribe((event) => {
      this.uri = this.router.url;
    });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        this.redirectUri = params['redirect'] ?? '';

        if (this.redirectUri.trim().length > 0) {
          this.couponCodeStore.setCurrentStep(3);
        }
      });
  }

  onNext() {
    this.couponCodeStore.setOnNext();
  }

  onBack() {
    this.couponCodeStore.setOnBack();
  }

  getButtonText(): string {
    if (this.redirectUri.length > 0) {
      if (
        this.uri.includes('coupon-codes/create') &&
        this.couponCodeStore.couponCodeScreenIndex() < 3
      ) {
        return 'Next';
      }
      return 'Save';
    }

    return 'Next';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
