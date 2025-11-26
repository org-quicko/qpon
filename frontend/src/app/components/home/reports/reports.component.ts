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
    ['redemptions', 'Get a report of redeemed coupon codes, including who used them, what they purchased, how much they spent, and more.'],
    ['sales by items', 'Get an item wise report showing sales amounts and discounts given.'],
    ['sales by customers', 'Get a customer wise report showing sales amounts and discounts given.'],
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

      this.reportsStore.downloadReport(reportName as ReportName, {
        from: formData.start.format("YYYY-MM-DD"),
        to: formData.end.format("YYYY-MM-DD"),
      });
    });
  }
}