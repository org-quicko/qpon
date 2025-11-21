import { CommonModule } from '@angular/common';
import { Component, Inject, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormDialogBoxComponent } from '../../common/form-dialog-box/form-dialog-box.component';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

export const MY_FORMATS = {
	parse: { dateInput: 'Do MMM, YYYY' },
	display: {
		dateInput: 'Do MMM, YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'Do MMM, YYYY',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};


@Component({
	selector: 'app-generate-report-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatSelectModule,
		MatDatepickerModule,
		MatInputModule,
		MatButtonModule,
		MatDividerModule,
		MatIconModule,
		FormDialogBoxComponent,
	],
	templateUrl: './report-dialog-box.component.html',
	providers: [
		provideMomentDateAdapter(MY_FORMATS),
	]
})
export class GenerateReportDialogComponent {

	reportForm!: FormGroup;

	reportPeriod = [
		{ key: 'this_week', label: 'This week' },
		{ key: 'this_month', label: 'This month' },
		{ key: 'last_7_days', label: 'Last 7 days' },
		{ key: 'last_30_days', label: 'Last 30 days' },
		{ key: 'last_90_days', label: 'Last 90 days' },
		{ key: 'last_365_days', label: 'Last 365 days' },
		{ key: 'custom', label: 'Custom' },
	];

	minDate = new Date(2020, 0, 1);
	maxDate = new Date();

	/** IMPORTANT: prevents auto date change from switching to custom */
	private isAutoSettingDates = false;

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<GenerateReportDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { reportName: string; loading: Signal<boolean>; }
	) {
		this.initForm();
		this.onPeriodSelection();
		this.setupCustomSwitching();
	}

	/** INIT FORM */
	initForm() {
		this.reportForm = this.fb.group({
			reportPeriod: ['last_7_days', Validators.required],

			// Always enabled
			start: [null],
			end: [null]
		});

		this.setDatesBasedOnPeriod('last_7_days');
	}

	/** Change preset → auto-fill start/end */
	onPeriodSelection() {
		this.reportForm.get('reportPeriod')!.valueChanges.subscribe((period) => {
			if (period !== 'custom') {
				this.setDatesBasedOnPeriod(period);
			}
		});
	}

	/** Switch to custom when user changes date manually */
	setupCustomSwitching() {
		this.reportForm.get('start')!.valueChanges.subscribe(() => this.switchToCustom());
		this.reportForm.get('end')!.valueChanges.subscribe(() => this.switchToCustom());
	}

	/** ONLY switch to custom when user edits, NOT auto-patch */
	switchToCustom() {
		if (this.isAutoSettingDates) return;

		if (this.reportForm.get('reportPeriod')!.value !== 'custom') {
			this.reportForm.patchValue({ reportPeriod: 'custom' }, { emitEvent: false });
		}
	}

	/** PRESET DATE LOGIC */
	setDatesBasedOnPeriod(period: string) {
		const today = new Date();
		let start: Date = today;
		let end: Date = today;

		switch (period) {
			case 'this_week':
				start = new Date(today);
				start.setDate(today.getDate() - today.getDay());
				break;

			case 'this_month':
				start = new Date(today.getFullYear(), today.getMonth(), 1);
				break;

			case 'last_7_days':
				start = new Date(today);
				start.setDate(today.getDate() - 7);
				break;

			case 'last_30_days':
				start = new Date(today);
				start.setDate(today.getDate() - 30);
				break;

			case 'last_90_days':
				start = new Date(today);
				start.setDate(today.getDate() - 90);
				break;

			case 'last_365_days':
				start = new Date(today);
				start.setDate(today.getDate() - 365);
				break;

			default:
				return;
		}

		// Prevent triggering custom mode during auto update
		this.isAutoSettingDates = true;

		this.reportForm.patchValue({ start, end });

		this.isAutoSettingDates = false;
	}

	/** SUBMIT */
	onSubmit = () => {
		if (this.reportForm.invalid) return;

		this.dialogRef.close(this.reportForm.getRawValue());
	};
}
