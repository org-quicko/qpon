import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CurrencyPipe, NgClass, TitleCasePipe } from '@angular/common';
import { OrganizationStore } from '../../../store/organization.store';
import { CouponsStore } from '../../../store/coupons.store';
import { DatePipe } from '../../../pipe/date.pipe';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { CouponDto } from '../../../../dtos/coupon.dto';

@Component({
  selector: 'app-coupons',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    NgClass,
  ],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.html',
})
export class CouponsComponent implements OnInit, AfterViewInit {
  columns = ['name', 'discount', 'applicable_on', 'status', 'created_at', 'menu'];

  couponDatasource = new MatTableDataSource<CouponDto>();

  couponsStore = inject(CouponsStore);
  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;

  coupons = this.couponsStore.coupons;
  count = this.couponsStore.count!;
  take = this.couponsStore.take!;
  skip = this.couponsStore.skip!;

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.couponDatasource.paginator = this.paginator;
  }

  openDialog(coupon: CouponDto) {
    this.dialog.open(ChangeStatusComponent, {
      data: { coupon, organizationId: this.organization()?.organizationId },
      autoFocus: false
    })
  }

  onPageChange(event: PageEvent) {
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
      skip: (event.pageIndex) * event.pageSize,
      take: event.pageSize
    })
  }

  ngOnInit(): void {
    this.couponsStore.fetchCoupons({
      organizationId: this.organization()?.organizationId!,
    });
  }
}
