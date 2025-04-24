import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CouponFilter } from '../../../../types/coupon-filter.interface';
import { FiltersStore } from '../../../../store/filters.store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-coupon-filter-dialog',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './coupon-filter-dialog.component.html',
  styleUrls: ['./coupon-filter-dialog.component.css'],
})
export class CouponFilterDialogComponent {
  filterForm: FormGroup;
  filter = signal<CouponFilter | null>(null);

  filtersStore = inject(FiltersStore);
  readonly dialogRef = inject(MatDialogRef<CouponFilterDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  constructor() {
    this.filterForm = new FormGroup({
      status: new FormControl(this.data?.couponFilter?.status ?? ''),
      itemConstraint: new FormControl(
        this.data?.couponFilter?.itemConstraint ?? ''
      ),
      discountType: new FormControl(
        this.data?.couponFilter?.discountType ?? ''
      ),
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onClearAll() {
    this.filterForm.reset();
    this.filtersStore.setCouponFilter(null);
  }

  onSelectStatus(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      status: event.value,
    });
  }

  onSelectItemConstraint(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      itemConstraint: event.value,
    });
  }

  onSelectDiscountType(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      discountType: event.value,
    });
  }

  onApply() {
    this.filtersStore.setCouponFilter(this.filter());
    this.dialogRef.close(this.filter());
  }
}
