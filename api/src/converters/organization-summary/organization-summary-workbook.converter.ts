import { Injectable } from '@nestjs/common';
import { OrganizationSummaryWorkbook } from '@org-quicko/qpon-sheet-core/organization_summary_workbook/beans';
import { OrganizationSummaryMv } from '../../entities/organization-summary.view';
import { OrganizationSummaryTableConverter } from './organization-summary-table.converter';

@Injectable()
export class OrganizationSummaryWorkbookConverter {

  private organizationSummaryTableConverter: OrganizationSummaryTableConverter;

  constructor() {
    this.organizationSummaryTableConverter = new OrganizationSummaryTableConverter();
  }

  convert(
    organizationSummaryMv: OrganizationSummaryMv,
  ): OrganizationSummaryWorkbook {
    const organizationSummaryWorkbook = new OrganizationSummaryWorkbook();

    const organizationSummarySheet = organizationSummaryWorkbook.getOrganizationSummarySheet();

    const organizationSummaryTable = this.organizationSummaryTableConverter.convert(organizationSummaryMv);

    organizationSummarySheet.replaceBlock(organizationSummaryTable);

    return organizationSummaryWorkbook;
  }
}
