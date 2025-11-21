import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GenerateReportDialogComponent } from './report-dialog-box/report-dialog-box.component';
import { ReportName, ReportsStore } from './store/reports.store';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatRippleModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {

  constructor(
    private dialog: MatDialog,
    private reportsStore: ReportsStore
  ) { }

  reportsMap = [
    ['redemptions', 'local_activity'],
    ['sales by items', 'deployed_code_account'],
    ['sales by customers', 'group_add'],
  ];

  reportsDesc = new Map<string, string>([
    ['redemptions', 'View redemption logs & summary'],
    ['sales by items', 'See item-wise sales insights'],
    ['sales by customers', 'Analyze customer-specific sales'],
  ]);

  onClickReport(reportName: string) {
    this.dialog.open(GenerateReportDialogComponent, {
      width: '516px',
      data: {
        reportName,
        loading: this.reportsStore.loading
      }
    }).afterClosed().subscribe((formData) => {
      if (!formData) return;
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      this.reportsStore.downloadReport(reportName as ReportName, {
        from: formatDate(formData.start),
        to: formatDate(formData.end)
      });
    });
  }
}