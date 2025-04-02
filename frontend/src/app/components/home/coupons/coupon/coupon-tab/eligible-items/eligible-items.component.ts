import { Component, effect, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CouponStore } from '../../store/coupon.store';
import { EligibleItemsStore } from './store/eligible-items.store';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { ActivatedRoute, Params } from '@angular/router';
import { ItemDto } from '../../../../../../../dtos/item.dto';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { NgFor, NgStyle } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-eligible-items',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    NgFor,
    NgStyle,
    NgxSkeletonLoaderModule,
  ],
  providers: [EligibleItemsStore],
  templateUrl: './eligible-items.component.html',
  styleUrl: './eligible-items.component.css',
})
export class EligibleItemsComponent implements OnInit {
  columns = ['name', 'description', 'menu'];
  couponId: string;

  couponStore = inject(CouponStore);
  eligibleItemsStore = inject(EligibleItemsStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
  eligibleItems = this.eligibleItemsStore.items;
  coupon = this.couponStore.coupon.data;
  isLoading = this.eligibleItemsStore.isLoading;

  datasource = new MatTableDataSource<ItemDto>();

  constructor(private route: ActivatedRoute) {
    this.couponId = '';

    effect(() => {
      this.datasource.data = this.eligibleItemsStore.items() ?? [];
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });

    this.eligibleItemsStore.fetchItems({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
    });

    this;
  }
}
