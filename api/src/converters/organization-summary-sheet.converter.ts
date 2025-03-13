import { Injectable } from '@nestjs/common';
import {
  OrganizationSummaryRow,
  OrganizationSummarySheet,
  OrganizationSummaryTable,
  OrganizationSummaryWorkbook,
} from 'generated/sources';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';

@Injectable()
export class OrganizationSummarySheetConverter {
  convert(
    organizationSummaryMv: OrganizationSummaryMv,
  ): OrganizationSummaryWorkbook {
    const organizationSummaryTable = new OrganizationSummaryTable();

    const organizationSummaryRow = new OrganizationSummaryRow([]);
    organizationSummaryRow.setOrganizationId(
      organizationSummaryMv.organizationId,
    );
    organizationSummaryRow.setTotalRedemptionCount(
      organizationSummaryMv.totalRedemptionCount,
    );
    organizationSummaryRow.setTotalRedemptionAmount(
      organizationSummaryMv.totalRedemptionAmount,
    );
    organizationSummaryRow.setActiveCouponCount(
      organizationSummaryMv.activeCouponCount,
    );
    organizationSummaryRow.setInactiveCouponCount(
      organizationSummaryMv.inactiveCouponCount,
    );
    organizationSummaryRow.setActiveCampaignCount(
      organizationSummaryMv.activeCampaignCount,
    );
    organizationSummaryRow.setInactiveCampaignCount(
      organizationSummaryMv.inactiveCampaignCount,
    );
    organizationSummaryRow.setActiveCouponCodeCount(
      organizationSummaryMv.activeCouponCodeCount,
    );
    organizationSummaryRow.setCreatedAt(
      organizationSummaryMv.createdAt.toISOString(),
    );
    organizationSummaryRow.setUpdatedAt(
      organizationSummaryMv.updatedAt.toISOString(),
    );

    organizationSummaryTable.addRow(organizationSummaryRow);

    const organizationSummarySheet = new OrganizationSummarySheet();
    organizationSummarySheet.addOrganizationSummaryTable(
      organizationSummaryTable,
    );

    const organizationSummaryWorkbook = new OrganizationSummaryWorkbook();
    organizationSummaryWorkbook.addOrganizationSummarySheet(
      organizationSummarySheet,
    );

    return organizationSummaryWorkbook;
  }
}
