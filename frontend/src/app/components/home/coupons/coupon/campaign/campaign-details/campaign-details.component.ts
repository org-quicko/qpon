import { Component, Input, OnInit, Signal } from '@angular/core';
import { CampaignSummaryRow } from '../../../../../../../generated/sources/campaign_summary_workbook';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-campaign-details',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, NgxSkeletonLoaderModule, NgClass, TitleCasePipe],
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.css']
})
export class CampaignDetailsComponent {

  @Input() campaign!: Signal<CampaignSummaryRow | null>;
  @Input() isLoading!: Signal<boolean | null>;

  getFormattedDate(date: string) {
    return new Date(date).toDateString();
  }
}
