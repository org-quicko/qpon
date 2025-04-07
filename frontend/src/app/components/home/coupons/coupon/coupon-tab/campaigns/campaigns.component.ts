import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CampaignsStore } from './store/campaigns.store';
import { CouponStore } from '../../store/coupon.store';
import { CouponDto } from '../../../../../../../dtos/coupon.dto';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  CampaignSummaryRow,
  CampaignSummarySheet,
} from '../../../../../../../generated/sources/campaign_summary_workbook';
import { MatInputModule } from '@angular/material/input';
import { CustomDatePipe } from '../../../../../../pipe/date.pipe';
import { CurrencyPipe, NgClass, NgFor, NgStyle, TitleCasePipe } from '@angular/common';
import { OrganizationStore } from '../../../../../../store/organization.store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-campaigns',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    CustomDatePipe,
    TitleCasePipe,
    CurrencyPipe,
    NgClass,
    NgFor,
    NgStyle,
    NgxSkeletonLoaderComponent,
    ReactiveFormsModule,
  ],
  providers: [CampaignsStore, CouponStore],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.css',
})
export class CampaignsComponent implements OnInit {
  private couponId: string;
  filterForm: FormGroup;
  readonly dialog = inject(MatDialog);

  campaignsStore = inject(CampaignsStore);
  organizationStore = inject(OrganizationStore);
  datasource = new MatTableDataSource<CampaignSummaryRow>();

  campaignSummaries = this.campaignsStore.campaignSummaries;
  organization = this.organizationStore.organizaiton;
  isLoading = this.campaignsStore.isLoading;

  columns = [
    'name',
    'total_budget',
    'total_discount',
    'redemptions',
    'status',
    'created_at',
    'menu',
  ];

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) {
    this.couponId = '';

    this.filterForm = this.formBuilder.group({
          status: null,
    });
    

    effect(() => {
      this.datasource.data = this.campaignsStore.campaignSummaries() ?? [];
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });
    this.campaignsStore.fetchCampaingSummaries({ couponId: this.couponId });
  }

  convertToCampaignSummaryRow(row: any[]) {
    return new CampaignSummaryRow(row);
  }

  openDialog(campaign: CampaignSummaryRow) {
    this.dialog.open(ChangeStatusComponent, {
      data: {
        couponId: this.couponId,
        campaign,
        deactivateCampaign: this.campaignsStore.deactivateCampaign,
        activateCampaign: this.campaignsStore.activateCampaign,
      },
      autoFocus: false,
    });
  }

  resetForm() {
    this.filterForm.reset();
  }

  onRowClick(campaignId: string) {
    this.router.navigate([`./campaigns/${campaignId}`], { relativeTo: this.route })
  }
}
