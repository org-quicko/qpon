import { JSONArray } from '@org-quicko/core';
import { OrganizationSummaryRow, OrganizationSummaryTable } from '@org-quicko/qpon-sheet-core/organization_summary_workbook/beans';
import { OrganizationSummaryMv } from '../../entities/organization-summary.view';

export class OrganizationSummaryTableConverter {
  convert(
    organizationSummaryTable: OrganizationSummaryTable,
    organizationSummaryMv: OrganizationSummaryMv,
  ) {
    const organizationSummaryRow = new OrganizationSummaryRow(new JSONArray());
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
  }
}
