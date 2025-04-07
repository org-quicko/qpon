import { Component, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { FiltersStore } from '../../../../../../../store/filters.store';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CouponCodeFilter } from '../../../../../../../types/coupon-code-filter.interface';

@Component({
  selector: 'app-filter-dialog',
  imports: [MatIconModule, MatButtonModule, MatDividerModule, MatChipsModule, ReactiveFormsModule],
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css']
})
export class FilterDialogComponent {
  isLoading = false;
  filterForm: FormGroup
  filter = signal<CouponCodeFilter | null>(null);

  filtersStore = inject(FiltersStore);
  readonly dialogRef = inject(MatDialogRef<FilterDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  constructor() {
    this.filterForm = new FormGroup({
      status: new FormControl(this.data?.couponCodeFilter?.status ?? ''),
      visibility: new FormControl(this.data?.couponCodeFilter?.visibility ?? ''),
      durationType: new FormControl(this.data?.couponCodeFilter?.durationType ?? ''),
    })
  }

  onCancel() {
    this.dialogRef.close();
  }

  onClearAll() {
    this.filterForm.reset();
    this.filtersStore.setCouponCodeFilter(null);
  }

  onSelectStatus(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      status: event.value
    })
  }

  onSelectVisibility(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      visibility: event.value
    })
  }

  onSelectDurationType(event: MatChipListboxChange) {
    this.filter.set({
      ...this.filter(),
      durationType: event.value
    })
  }

  onApply() {
    this.filtersStore.setCouponCodeFilter(this.filter())
    this.dialogRef.close(this.filter())
  }
}
