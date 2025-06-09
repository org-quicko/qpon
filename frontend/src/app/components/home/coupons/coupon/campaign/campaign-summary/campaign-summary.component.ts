import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CampaignSummaryRow } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CurrencyPipe } from '@angular/common';
import { OrganizationStore } from '../../../../../../store/organization.store';

@Component({
  selector: 'app-campaign-summary',
  imports: [MatCardModule, NgxSkeletonLoaderModule, CurrencyPipe],
  templateUrl: './campaign-summary.component.html',
  styleUrls: ['./campaign-summary.component.css']
})
export class CampaignSummaryComponent{
  @Input() campaign!: Signal<CampaignSummaryRow | null>;
  @Input() isLoading!: Signal<boolean | null>;

  organizationStore = inject(OrganizationStore);

  organization = this.organizationStore.organizaiton;
}
