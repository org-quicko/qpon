import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RedemptionRow } from '../../../../../../../../generated/sources/redemption_workbook';
import { RedemptionsStore } from './store/redemptions.store';
import { ActivatedRoute, Params } from '@angular/router';
import { OrganizationStore } from '../../../../../../../store/organization.store';
import { CustomDatePipe } from '../../../../../../../pipe/date.pipe';
import { NgClass, NgIf } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-redemption-list',
  imports: [MatIconModule, MatInputModule, MatTableModule, ReactiveFormsModule, CustomDatePipe, NgxSkeletonLoaderModule, NgClass],
  providers: [RedemptionsStore],
  templateUrl: './redemption-list.component.html',
  styleUrls: ['./redemption-list.component.css']
})
export class RedemptionListComponent implements OnInit {
  columns = ["name", "email", "discount", "createdAt"]
  searchControl: FormControl;
  couponId: string;
  campaignId: string;
  couponCodeId: string;
  tempDatasource: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  isFilterApplied: boolean = false;

  redemptionsStore = inject(RedemptionsStore);
  organizationsStore = inject(OrganizationStore);

  redemptions = this.redemptionsStore.redemptions;
  isLoading = this.redemptionsStore.isLoading;
  organization = this.organizationsStore.organizaiton;
  count = this.redemptionsStore.count;

  datasource = new MatTableDataSource<RedemptionRow | number>();

  // @ViewChild(MatPag)

  constructor(private route: ActivatedRoute) { 
    this.searchControl = new FormControl('');
    this.couponId = '';
    this.campaignId = '';
    this.couponCodeId = '';
    this.isFilterApplied = false;

    effect(() => {
      this.datasource.data = this.isLoading()
        ? this.tempDatasource
        : this.redemptions() ?? [];
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
      this.campaignId = params['campaign_id'];
      this.couponCodeId = params['coupon_code_id'];
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.isFilterApplied = true;

      this.redemptionsStore.fetchRedemptions({
        organizationId: this.organization()?.organizationId!,
        couponId: this.couponId,
        campaignId: this.campaignId,
        couponCodeId: this.couponCodeId,
        filter: {email: value.trim()}
      })
    })

    this.redemptionsStore.fetchRedemptions({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      campaignId: this.campaignId,
      couponCodeId: this.couponCodeId,
    })
  }

}
