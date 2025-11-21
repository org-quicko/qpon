import { plainToInstance, Type } from 'class-transformer';

export class SalesSummaryRow {
  date!: string;
  grossSalesAmount!: number;
  discountAmount!: number;
  netSalesAmount!: number;
}

export class SalesSummaryItem {
  key!: string;
  value!: number | string;
}

export class SalesSummary {
  @Type(() => SalesSummaryRow)
  graphData: SalesSummaryRow[] = [];

  @Type(() => SalesSummaryItem)
  summaryItems: SalesSummaryItem[] = [];
}

/** -------- TRANSFORMER FUNCTION -------- **/
export function transformSalesSummary(data: any): SalesSummary {
  const salesData = new SalesSummary();

  try {
    const sheet = data?.sheets?.[0];
    if (!sheet) return salesData;

    // Parse Graph / Trend Data
    const graphBlock = sheet.blocks?.[0];
    if (graphBlock?.rows) {
      salesData.graphData = graphBlock.rows.map((r: any[]) => ({
        date: r?.[0] ?? '',
        grossSalesAmount: +r?.[1] || 0,
        discountAmount: +r?.[2] || 0,
        netSalesAmount: +r?.[3] || 0,
      }));
    }

    // Parse Summary Items
    const summaryBlock = sheet.blocks?.[1];
    if (summaryBlock?.items) {
      salesData.summaryItems = summaryBlock.items.map((i: any) => ({
        key: i.key,
        value: i.value,
      }));
    }

    return plainToInstance(SalesSummary, salesData);
  } catch (e) {
    console.error('❌ Failed to transform sales summary:', e);
    return salesData;
  }
}
