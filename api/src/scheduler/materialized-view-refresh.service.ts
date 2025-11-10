import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class MaterializedViewRefreshService {
  private readonly logger = new Logger(MaterializedViewRefreshService.name);
  private readonly cronExpression: string;

  constructor(private readonly dataSource: DataSource) {
    this.cronExpression = process.env.REFRESH_MV_CRON || '*/30 * * * * *';
    this.logger.log(`⏱️ MaterializedViewRefreshService initialized (Cron: ${this.cronExpression})`);
  }

  // List of materialized views to refresh
  private readonly materializedViews = [
    'campaign_summary_mv',
    'coupon_summary_mv',
    'organization_summary_mv',
    'organizations_mv',
    'coupon_codes_wise_day_wise_redemption_summary_mv',
    'day_wise_redemption_summary_mv',
    'item_wise_day_wise_redemption_summary_mv',
  ];

  // Run cron job
  @Cron(process.env.REFRESH_MV_CRON || '*/30 * * * * *', {
    name: 'refreshMaterializedViewsJob',
  })
  async refreshMaterializedViews() {
    this.logger.log('⏳ Running materialized view refresh job...');

    for (const view of this.materializedViews) {
      try {
        // Refresh each materialized view
        await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${view};`);
        this.logger.log(`✅ Refreshed ${view}`);
      } catch (error) {
        this.logger.error(`❌ Failed to refresh ${view}: ${error.message}`);
      }
    }

    this.logger.log('🎯 Materialized view refresh job completed');
  }
}
