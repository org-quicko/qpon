import { Injectable, signal, computed, inject } from '@angular/core';
import { ReportService } from '../../../../services/reports.service';
import { OrganizationStore } from '../../../../store/organization.store';

export type ReportName =
	| 'redemptions'
	| 'sales by items'
	| 'sales by customers';

export interface ReportPayload {
	from: string;
	to: string;
}

@Injectable({
	providedIn: 'root',
})
export class ReportsStore {

	private organizationStore = inject(OrganizationStore);

	// signal from organization store
	organization = computed(() => this.organizationStore.organizaiton());
	organizationId = computed(() => this.organization()?.organizationId ?? null);

	loading = signal(false);
	error = signal<string | null>(null);

	constructor(
		private reportService: ReportService
	) { }

	/**
	 * Map reportName → API function
	 */
	private reportHandlers: Record<
		ReportName,
		(orgId: string, from: string, to: string) => any
	> = {
			'redemptions': (orgId, from, to) =>
				this.reportService.getRedemptionsReport(orgId, from, to),

			'sales by items': (orgId, from, to) =>
				this.reportService.getItemsReport(orgId, from, to),

			'sales by customers': (orgId, from, to) =>
				this.reportService.getCustomersReport(orgId, from, to),
		};

	/**
	 * Public method to call correct report
	 */
	downloadReport(reportName: ReportName, payload: ReportPayload) {
		const orgId = this.organizationId();

		if (!orgId) {
			this.error.set('Organization ID is missing');
			return;
		}

		const handler = this.reportHandlers[reportName];
		if (!handler) {
			this.error.set(`Unknown report: ${reportName}`);
			return;
		}

		this.loading.set(true);
		this.error.set(null);

		handler(orgId, payload.from, payload.to).subscribe({
			next: (blob: Blob) => {
				this.saveFile(blob, `${reportName}.csv`);
				this.loading.set(false);
			},
			error: (err: any) => {
				this.error.set(err?.message || 'Failed to download report');
				this.loading.set(false);
			},
		});
	}

	/**
	 * Download Utility
	 */
	private saveFile(blob: Blob, fileName: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(url);
		a.remove();
	}
}
